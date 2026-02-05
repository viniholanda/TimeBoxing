import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Clock, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

// Generate time slots (6:00 to 22:00)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22
const SLOTS = HOURS.flatMap(hour => [
    `${hour.toString().padStart(2, '0')}:00`,
    `${hour.toString().padStart(2, '0')}:30`
]);

// Get current time slot
const getCurrentSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const slot = minutes < 30 ? '00' : '30';
    return `${hours.toString().padStart(2, '0')}:${slot}`;
};

interface TimeSlotProps {
    time: string;
    isCurrentSlot: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ time, isCurrentSlot }) => {
    const { tasks } = useTasks();
    const { setNodeRef, isOver } = useDroppable({
        id: time,
    });

    // Find tasks scheduled for this specific time slot
    const slotTasks = tasks.filter(t => t.scheduledTime === time && t.status !== 'completed');


    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex min-h-[4rem] group border-b border-border/50 transition-colors",
                isOver && "bg-primary/10 border-primary/30",
                isCurrentSlot && "bg-blue-50/50 border-l-2 border-l-blue-500"
            )}
        >
            <div className={cn(
                "w-16 py-2 pr-4 text-right text-xs border-r border-border/50 font-mono shrink-0 transition-colors",
                isCurrentSlot ? "text-blue-600 font-semibold" : "text-muted-foreground"
            )}>
                {time}
            </div>
            <div className="flex-1 p-1 space-y-1 relative min-h-[3.5rem]">
                {/* Visual guide line */}
                {!slotTasks.length && !isOver && (
                    <div className="absolute inset-0 top-1/2 border-t border-dashed border-border/20 w-full -z-10 group-hover:border-border/40 transition-colors" />
                )}

                {/* Drop indicator */}
                {isOver && slotTasks.length === 0 && (
                    <div className="absolute inset-2 border-2 border-dashed border-primary/50 rounded-md flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">Solte aqui</span>
                    </div>
                )}

                {slotTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
};

export const TimelinePanel: React.FC = () => {
    const { tasks } = useTasks();
    const currentSlot = getCurrentSlot();
    const scheduledCount = tasks.filter(t => t.scheduledTime && t.status !== 'completed').length;

    return (
        <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-4">
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
                <div className="flex-1 overflow-y-auto mx-6 mb-6 border rounded-lg bg-card">
                    {SLOTS.map(time => (
                        <TimeSlot
                            key={time}
                            time={time}
                            isCurrentSlot={time === currentSlot}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};
