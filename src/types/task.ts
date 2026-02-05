export interface Task {
    id: string;
    title: string;
    duration: number; // in minutes
    scheduledTime?: string; // ISO string for the start time if scheduled
    status: 'idle' | 'active' | 'completed';
    completedAt?: string; // ISO date string when completed
    createdAt?: string; // ISO date string when created
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
