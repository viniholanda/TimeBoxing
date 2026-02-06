export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface Task {
    id: string;
    title: string;
    duration: number; // in minutes
    scheduledTime?: string; // "HH:MM" format for the start time if scheduled
    status: 'idle' | 'active' | 'completed';
    completedAt?: string; // ISO date string when completed
    createdAt?: string; // ISO date string when created

    // Recurrence properties
    recurrence?: RecurrencePattern;
    recurrenceTime?: string; // "HH:MM" - time to schedule recurring tasks
    parentRecurringId?: string; // ID of the parent recurring task template
    isRecurringTemplate?: boolean; // True if this is a template, not an actual task
}

export type TaskStatus = Task['status'];

// Statistics interface for the dashboard
export interface TaskStats {
    totalTasksToday: number;
    completedToday: number;
    totalFocusTimeToday: number; // in minutes
    streak: number; // consecutive days with completed tasks
    completionRate: number; // percentage 0-100
}

