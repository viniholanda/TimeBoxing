import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Clock, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22
const HOUR_HEIGHT_PX = 120; // Height in pixels for 1 hour
const START_HOUR = 6; // Timeline starts at 6:00

// Get current time slot
// Get current time slot
const getCurrentSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const slot = Math.floor(minutes / 15) * 15;
    return `${hours.toString().padStart(2, '0')}:${slot.toString().padStart(2, '0')}`;
};

// Convert time string "HH:MM" to pixels from top of timeline
const timeToPixels = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - START_HOUR) * 60 + m;
    return (totalMinutes / 60) * HOUR_HEIGHT_PX;
};

// Convert duration in minutes to pixels
const durationToPixels = (minutes: number): number => {
    return (minutes / 60) * HOUR_HEIGHT_PX;
};

interface HourBlockProps {
    hour: number;
    currentSlot: string;
}

const HourBlock: React.FC<HourBlockProps> = ({ hour, currentSlot }) => {
    const hourStr = hour.toString().padStart(2, '0');

    // Create drop zones for 00, 15, 30, 45
    const slots = ['00', '15', '30', '45'];

    return (
        <div
            className="flex border-b border-border/50 relative"
            style={{ height: `${HOUR_HEIGHT_PX}px` }}
        >
            {/* Time label column */}
            <div className={cn(
                "w-16 py-2 pr-3 text-right text-xs border-r border-border/50 font-mono shrink-0 transition-colors relative",
                slots.some(s => `${hourStr}:${s}` === currentSlot) ? "text-blue-600 font-semibold" : "text-muted-foreground"
            )}>
                {`${hourStr}:00`}
                {slots.some(s => `${hourStr}:${s}` === currentSlot) && (
                    <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-blue-500" />
                )}
            </div>

            {/* Content area with 4 droppable zones */}
            <div className="flex-1 relative flex flex-col h-full">
                {slots.map((min) => (
                    <SubDropZone
                        key={min}
                        time={`${hourStr}:${min}`}
                        isCurrent={`${hourStr}:${min}` === currentSlot}
                    />
                ))}
            </div>
        </div>
    );
};

interface SubDropZoneProps {
    time: string;
    isCurrent: boolean;
}

const SubDropZone: React.FC<SubDropZoneProps> = ({ time, isCurrent }) => {
    const { setNodeRef, isOver } = useDroppable({ id: time });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-full transition-colors relative flex-1 border-b border-dotted border-border/10 last:border-0",
                isOver && "bg-primary/10",
                isCurrent && "bg-blue-50/30"
            )}
        >
            {isOver && (
                <div className="absolute inset-0.5 border-2 border-dashed border-primary/50 rounded flex items-center justify-center pointer-events-none z-20">
                    <span className="text-[10px] text-primary font-medium">Solte aqui</span>
                </div>
            )}
        </div>
    );
};

// Separate component to render all scheduled tasks
const TasksLayer: React.FC = () => {
    const { tasks } = useTasks();

    const scheduledTasks = tasks.filter(t =>
        t.scheduledTime &&
        t.status !== 'completed' &&
        parseInt(t.scheduledTime.split(':')[0]) >= START_HOUR
    ).sort((a, b) => {
        // Sort by scheduled time
        const [hA, mA] = a.scheduledTime!.split(':').map(Number);
        const [hB, mB] = b.scheduledTime!.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
    });

    return (
        <>
            {scheduledTasks.map(task => {
                const topPx = timeToPixels(task.scheduledTime!);
                const heightPx = durationToPixels(task.duration);

                return (
                    <div
                        key={task.id}
                        className="absolute z-10 pointer-events-auto px-0.5 transition-all duration-300"
                        style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: '0',
                            width: '100%',
                        }}
                    >
                        <TaskCard
                            task={task}
                            className="mb-0 h-full shadow-sm hover:z-20 hover:shadow-md ring-1 ring-background/50 overflow-hidden"
                            style={{ height: '100%' }}
                        />
                    </div>
                );
            })}
        </>
    );
};

export const TimelinePanel: React.FC = () => {
    const { tasks } = useTasks();
    const currentSlot = getCurrentSlot();
    const scheduledCount = tasks.filter(t => t.scheduledTime && t.status !== 'completed').length;

    // Total height for all hours
    const totalHeight = HOURS.length * HOUR_HEIGHT_PX;

    return (
        <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-4 shrink-0 z-20 bg-card border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-base">Agenda</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {currentSlot}
                            </Badge>
                            {scheduledCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {scheduledCount} agendadas
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto bg-card">
                    <div className="relative" style={{ height: `${totalHeight + 64}px` }}>
                        {/* Hour blocks (grid lines + droppables) */}
                        {HOURS.map(hour => (
                            <HourBlock
                                key={hour}
                                hour={hour}
                                currentSlot={currentSlot}
                            />
                        ))}

                        {/* Task cards layer - rendered on top, aligned with content area */}
                        <div className="absolute top-0 left-16 right-0 pointer-events-none pl-1" style={{ height: `${totalHeight}px` }}>
                            <TasksLayer />
                        </div>

                        {/* Extra padding at bottom */}
                        <div className="h-16" />
                    </div>
                </div>
            </Card>
        </div>
    );
};
