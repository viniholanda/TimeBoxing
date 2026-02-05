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
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay }) => {
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

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

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
                "mb-2 border-2 transition-all",
                isTimeUp
                    ? "border-green-500 bg-green-50 animate-pulse"
                    : "border-primary bg-primary/5"
            )}>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isTimeUp ? "bg-green-500" : "bg-primary animate-pulse"
                            )} />
                            <span className="font-medium">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1">


                            {!isTimeUp && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setIsPaused(!isPaused)}
                                >
                                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => stopTask()}
                            >
                                <Square className="w-3 h-3" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-6 w-6",
                                    isTimeUp && "text-green-600 hover:text-green-700 hover:bg-green-100"
                                )}
                                onClick={() => completeTask(task.id)}
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-secondary/50 rounded-full h-1 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-linear",
                                isTimeUp ? "bg-green-500" : progressPercent < 20 ? "bg-orange-500" : "bg-primary"
                            )}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default idle state
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group">
            <Card className={cn("mb-2 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors", isDragging && "opacity-30", isOverlay && "opacity-100 shadow-xl scale-105 border-primary bg-background z-50")}>
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{task.duration}m</span>

                        {/* Edit button - visible on hover */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                        >
                            <Pencil className="w-3 h-3" />
                        </Button>

                        {/* Delete button - visible on hover */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                            }}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>

                        {task.scheduledTime && !isOverlay && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                                e.stopPropagation();
                                startTask(task.id);
                            }}>
                                <Play className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
