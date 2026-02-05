import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { type Task, type TaskStats } from '../types/task';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get today's date as YYYY-MM-DD string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Check if a date string is today
const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.startsWith(getTodayString());
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
    addTask: (title: string, duration: number) => void;
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

    // Calculate statistics
    const stats = useMemo<TaskStats>(() => {
        const todayTasks = tasks.filter(t =>
            t.createdAt && isToday(t.createdAt) ||
            t.scheduledTime ||
            (t.completedAt && isToday(t.completedAt))
        );

        const completedToday = tasks.filter(t =>
            t.status === 'completed' && t.completedAt && isToday(t.completedAt)
        );

        const totalFocusTimeToday = completedToday.reduce((acc, t) => acc + t.duration, 0);

        const totalScheduledToday = tasks.filter(t => t.scheduledTime).length;
        const completionRate = totalScheduledToday > 0
            ? Math.round((completedToday.length / totalScheduledToday) * 100)
            : 0;

        return {
            totalTasksToday: todayTasks.length,
            completedToday: completedToday.length,
            totalFocusTimeToday,
            streak: calculateStreak(tasks),
            completionRate
        };
    }, [tasks]);

    const addTask = (title: string, duration: number) => {
        const newTask: Task = {
            id: generateId(),
            title,
            duration,
            status: 'idle',
            createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const scheduleTask = (id: string, time: string) => {
        updateTask(id, { scheduledTime: time });
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
                stats
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
