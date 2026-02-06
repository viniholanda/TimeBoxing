import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { type Task } from '../types/task';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { GripVertical, Play, CheckCircle, Pencil, Check, X, Trash2, Square, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTasks } from '../context/TaskContext';
import { playCompletionSound, playWarningSound } from '../lib/sounds';

interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
    style?: React.CSSProperties;
    className?: string; // Allow overriding classes like mb-2
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay, style, className }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDuration, setEditDuration] = useState(task.duration.toString());
    const [timeLeft, setTimeLeft] = useState(task.duration * 60); // in seconds
    const [isPaused, setIsPaused] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const hasPlayedWarning = useRef(false);
    const hasPlayedCompletion = useRef(false);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
        disabled: task.status !== 'idle' || isEditing
    });

    const { startTask, completeTask, stopTask, updateTask, deleteTask } = useTasks();

    // Timer effect for active tasks
    useEffect(() => {
        if (task.status !== 'active' || isPaused) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [task.status, isPaused]);

    // Reset timer when task becomes active
    useEffect(() => {
        if (task.status === 'active') {
            setTimeLeft(task.duration * 60);
            hasPlayedWarning.current = false;
            hasPlayedCompletion.current = false;
        }
    }, [task.status, task.duration]);

    // Sound effects
    useEffect(() => {
        if (task.status !== 'active') return;

        if (timeLeft === 60 && !hasPlayedWarning.current) {
            playWarningSound();
            hasPlayedWarning.current = true;
        }

        if (timeLeft === 0 && !hasPlayedCompletion.current) {
            playCompletionSound();
            hasPlayedCompletion.current = true;
        }
    }, [timeLeft, task.status]);

    useEffect(() => {
        if (isEditing && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditing]);

    const combinedStyle = {
        ...style,
        ...(transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        } : undefined),
    };

    const handleSave = () => {
        if (editTitle.trim()) {
            updateTask(task.id, {
                title: editTitle.trim(),
                duration: parseInt(editDuration) || 30
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDuration(task.duration.toString());
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Calculate progress percentage
    const totalSeconds = task.duration * 60;
    const progressPercent = Math.max(0, (timeLeft / totalSeconds) * 100);
    const isTimeUp = timeLeft === 0;

    // Format time display


    if (task.status === 'completed') {
        return (
            <Card className={cn("mb-2 opacity-60 bg-muted", isOverlay && "shadow-lg scale-105")}>
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="line-through">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{task.duration}m</span>
                </CardContent>
            </Card>
        );
    }

    // Edit mode
    if (isEditing) {
        return (
            <Card className="mb-2 border-primary ring-2 ring-primary/20">
                <CardContent className="p-3 space-y-2">
                    <Input
                        ref={titleInputRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Task title"
                        className="h-8"
                    />
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            onKeyDown={handleKeyDown}
                            min={5}
                            step={5}
                            className="w-20 h-8"
                        />
                        <span className="text-xs text-muted-foreground">minutos</span>
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleSave}>
                            <Check className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Active task with progress bar
    if (task.status === 'active') {
        return (
            <Card className={cn(
                "mb-2 border-2 transition-all shadow-lg",
                isTimeUp
                    ? "border-green-500 bg-green-50/50 dark:bg-green-500/10 shadow-green-500/20 animate-pulse"
                    : "border-primary bg-primary/5 shadow-primary/10"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(var(--color-primary),0.5)]",
                                isTimeUp ? "bg-green-500 shadow-green-500/50" : "bg-primary animate-pulse"
                            )} />
                            <span className="font-bold tracking-tight">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {!isTimeUp && (
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg shadow-sm"
                                    onClick={() => setIsPaused(!isPaused)}
                                >
                                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => stopTask()}
                            >
                                <Square className="w-3 h-3" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-7 w-7",
                                    isTimeUp && "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30"
                                )}
                                onClick={() => completeTask(task.id)}
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-linear",
                                isTimeUp ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : progressPercent < 20 ? "bg-orange-500" : "bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.3)]"
                            )}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Detect compact mode from className
    const isCompact = className?.includes('compact');

    // Default idle state
    return (
        <div ref={setNodeRef} style={combinedStyle} {...attributes} {...listeners} className={cn("touch-none group", isCompact ? "h-[20px]" : "h-full")}>
            <Card className={cn(
                "cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all duration-200",
                isCompact
                    ? "h-[20px] rounded-sm border-0 bg-transparent shadow-none"
                    : "mb-2 h-full shadow-sm hover:shadow-md hover:-translate-y-0.5 border-border/50 bg-card",
                isDragging && "opacity-30",
                isOverlay && "opacity-100 shadow-xl scale-105 border-primary bg-background z-50",
                className
            )}>
                <CardContent className={cn(
                    "flex items-center justify-between",
                    isCompact ? "p-0 px-1 h-[20px]" : "p-3 px-4 h-full"
                )}>
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <GripVertical className={cn("text-muted-foreground/40 shrink-0", isCompact ? "w-2 h-2" : "w-3.5 h-3.5")} />
                        <span className={cn("font-semibold truncate tracking-tight", isCompact ? "text-xs" : "text-sm text-foreground/90")}>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={cn(
                            "text-muted-foreground font-bold tracking-tighter opacity-80",
                            isCompact ? "text-[9px] bg-secondary/50 px-1 rounded-sm" : "text-[10px] bg-secondary px-1.5 py-0.5 rounded"
                        )}>
                            {task.duration}m
                        </span>

                        <div className="flex items-center ml-1">
                            {/* Edit button - visible on hover */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "opacity-0 group-hover:opacity-100 transition-all",
                                    isCompact ? "h-4 w-4" : "h-7 w-7"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            >
                                <Pencil className={isCompact ? "w-2 h-2" : "w-3 h-3"} />
                            </Button>

                            {/* Delete button - visible on hover */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "opacity-0 group-hover:opacity-100 transition-all text-destructive/70 hover:text-destructive hover:bg-destructive/10",
                                    isCompact ? "h-4 w-4" : "h-7 w-7"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                }}
                            >
                                <Trash2 className={isCompact ? "w-2 h-2" : "w-3 h-3"} />
                            </Button>

                            {task.scheduledTime && !isOverlay && !isCompact && (
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8 ml-1 bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startTask(task.id);
                                    }}
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
