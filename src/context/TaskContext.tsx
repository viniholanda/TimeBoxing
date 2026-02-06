import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type Task, type TaskStats, type RecurrencePattern } from '../types/task';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get today's date as YYYY-MM-DD string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Check if a date string is today
const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.startsWith(getTodayString());
};

// Get day of week (0 = Sunday, 1 = Monday, etc.)
const getDayOfWeek = () => new Date().getDay();

// Check if recurrence should trigger today
const shouldCreateToday = (recurrence: RecurrencePattern): boolean => {
    const dayOfWeek = getDayOfWeek();
    switch (recurrence) {
        case 'daily':
            return true;
        case 'weekdays':
            return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
        case 'weekly':
            return dayOfWeek === 1; // Every Monday
        default:
            return false;
    }
};

// Calculate streak (consecutive days with completed tasks)
const calculateStreak = (tasks: Task[]): number => {
    const completedDates = new Set(
        tasks
            .filter(t => t.status === 'completed' && t.completedAt)
            .map(t => t.completedAt!.split('T')[0])
    );

    if (completedDates.size === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (completedDates.has(dateStr)) {
            streak++;
        } else if (i > 0) {
            // Allow today to not have completions yet
            break;
        }
    }

    return streak;
};

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string, duration: number, recurrence?: RecurrencePattern, recurrenceTime?: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    scheduleTask: (id: string, time: string) => void;
    unscheduleTask: (id: string) => void;
    activeTask: Task | null;
    startTask: (id: string) => void;
    completeTask: (id: string) => void;
    stopTask: () => void;
    clearCompleted: () => void;
    stats: TaskStats;
    recurringTemplates: Task[];
    deleteRecurringTemplate: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('timeboxing-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    useEffect(() => {
        localStorage.setItem('timeboxing-tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Get recurring templates
    const recurringTemplates = useMemo(() =>
        tasks.filter(t => t.isRecurringTemplate),
        [tasks]
    );

    // Generate recurring tasks for today
    const generateRecurringTasks = useCallback(() => {
        const todayStr = getTodayString();

        recurringTemplates.forEach(template => {
            if (!template.recurrence || template.recurrence === 'none') return;
            if (!shouldCreateToday(template.recurrence)) return;

            // Check if we already created a task for this template today
            const alreadyCreated = tasks.some(t =>
                t.parentRecurringId === template.id &&
                t.createdAt?.startsWith(todayStr)
            );

            if (!alreadyCreated) {
                const newTask: Task = {
                    id: generateId(),
                    title: template.title,
                    duration: template.duration,
                    status: 'idle',
                    createdAt: new Date().toISOString(),
                    scheduledTime: template.recurrenceTime,
                    parentRecurringId: template.id,
                };
                setTasks(prev => [...prev, newTask]);
            }
        });
    }, [recurringTemplates, tasks]);

    // Run recurring task generation on mount and when templates change
    useEffect(() => {
        generateRecurringTasks();
    }, [generateRecurringTasks]);

    // Calculate statistics
    const stats = useMemo<TaskStats>(() => {
        const nonTemplateTasks = tasks.filter(t => !t.isRecurringTemplate);

        const todayTasks = nonTemplateTasks.filter(t =>
            t.createdAt && isToday(t.createdAt) ||
            t.scheduledTime ||
            (t.completedAt && isToday(t.completedAt))
        );

        const completedToday = nonTemplateTasks.filter(t =>
            t.status === 'completed' && t.completedAt && isToday(t.completedAt)
        );

        const totalFocusTimeToday = completedToday.reduce((acc, t) => acc + t.duration, 0);

        const totalScheduledToday = nonTemplateTasks.filter(t => t.scheduledTime).length;
        const completionRate = totalScheduledToday > 0
            ? Math.round((completedToday.length / totalScheduledToday) * 100)
            : 0;

        return {
            totalTasksToday: todayTasks.length,
            completedToday: completedToday.length,
            totalFocusTimeToday,
            streak: calculateStreak(nonTemplateTasks),
            completionRate
        };
    }, [tasks]);

    const addTask = (title: string, duration: number, recurrence?: RecurrencePattern, recurrenceTime?: string) => {
        if (recurrence && recurrence !== 'none') {
            // Create a recurring template
            const template: Task = {
                id: generateId(),
                title,
                duration,
                status: 'idle',
                createdAt: new Date().toISOString(),
                recurrence,
                recurrenceTime,
                isRecurringTemplate: true,
            };
            setTasks(prev => [...prev, template]);

            // Also create today's instance if applicable
            if (shouldCreateToday(recurrence)) {
                const todayInstance: Task = {
                    id: generateId(),
                    title,
                    duration,
                    status: 'idle',
                    createdAt: new Date().toISOString(),
                    scheduledTime: recurrenceTime,
                    parentRecurringId: template.id,
                };
                setTasks(prev => [...prev, todayInstance]);
            }
        } else {
            // Regular task
            const newTask: Task = {
                id: generateId(),
                title,
                duration,
                status: 'idle',
                createdAt: new Date().toISOString(),
            };
            setTasks(prev => [...prev, newTask]);
        }
    };

    const deleteRecurringTemplate = (id: string) => {
        // Delete template and all its instances
        setTasks(prev => prev.filter(t => t.id !== id && t.parentRecurringId !== id));
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    // Helper to convert time string to minutes
    const timeToMinutes = (time: string): number => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper to convert minutes to time string
    const minutesToTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Find next available slot that doesn't overlap
    const findAvailableSlot = (targetTime: string, duration: number, excludeId: string): string => {
        const scheduledTasks = tasks
            .filter(t => t.scheduledTime && t.status !== 'completed' && t.id !== excludeId)
            .map(t => ({
                start: timeToMinutes(t.scheduledTime!),
                end: timeToMinutes(t.scheduledTime!) + t.duration
            }))
            .sort((a, b) => a.start - b.start);

        let targetStart = timeToMinutes(targetTime);
        const targetEnd = targetStart + duration;

        // Check for overlaps and find next available slot
        for (const task of scheduledTasks) {
            // If target overlaps with this task
            if (targetStart < task.end && targetEnd > task.start) {
                // Move target to after this task (rounded to 15 min)
                targetStart = Math.ceil(task.end / 15) * 15;
            }
        }

        // Cap at 23:45 max
        if (targetStart > 23 * 60 + 45) {
            targetStart = 23 * 60 + 45;
        }

        return minutesToTime(targetStart);
    };

    const scheduleTask = (id: string, time: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // Find available slot (may adjust time if overlap)
        const availableTime = findAvailableSlot(time, task.duration, id);
        updateTask(id, { scheduledTime: availableTime });
    };

    const unscheduleTask = (id: string) => {
        updateTask(id, { scheduledTime: undefined });
    };

    const startTask = (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            updateTask(id, { status: 'active' });
            setActiveTask({ ...task, status: 'active' });
        }
    };

    const completeTask = (id: string) => {
        updateTask(id, {
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        setActiveTask(null);
    };

    const stopTask = () => {
        if (activeTask) {
            updateTask(activeTask.id, { status: 'idle' });
            setActiveTask(null);
        }
    };

    const clearCompleted = () => {
        setTasks(prev => prev.filter(t => t.status !== 'completed'));
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                scheduleTask,
                unscheduleTask,
                activeTask,
                startTask,
                completeTask,
                stopTask,
                clearCompleted,
                stats,
                recurringTemplates,
                deleteRecurringTemplate
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
