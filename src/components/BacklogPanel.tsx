import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Inbox, Repeat, ChevronDown, ChevronUp, Trash2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { type RecurrencePattern } from '../types/task';

const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
    none: 'Única',
    daily: 'Diária',
    weekdays: 'Dias úteis',
    weekly: 'Semanal',
};

export const BacklogPanel: React.FC = () => {
    const { tasks, addTask, clearCompleted, recurringTemplates, deleteRecurringTemplate } = useTasks();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('30');
    const [showRecurrence, setShowRecurrence] = useState(false);
    const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
    const [recurrenceTime, setRecurrenceTime] = useState('09:00');
    const [showRecurringSection, setShowRecurringSection] = useState(false);

    // Make backlog a droppable area
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog-droppable',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            addTask(
                title,
                parseInt(duration) || 30,
                recurrence !== 'none' ? recurrence : undefined,
                recurrence !== 'none' ? recurrenceTime : undefined
            );
            setTitle('');
            setRecurrence('none');
            setShowRecurrence(false);
        }
    };

    const backlogTasks = tasks.filter(t => !t.scheduledTime && t.status !== 'completed' && !t.isRecurringTemplate);
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="flex flex-col h-full gap-4">
            <Card className={cn(
                "flex-1 flex flex-col border-border/40 transition-all shadow-soft glass overflow-hidden",
                isOver && "ring-2 ring-primary/30 bg-primary/5"
            )}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <Inbox className="w-4 h-4 text-primary" />
                            </div>
                            <CardTitle className="text-base font-bold tracking-tight">Backlog</CardTitle>
                        </div>
                        <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider">
                            {backlogTasks.length}
                        </Badge>
                    </div>
                </CardHeader>

                <div className="px-6 pb-4 space-y-3">
                    <form onSubmit={handleAdd} className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nova tarefa..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                className="w-16 text-center"
                                min={5}
                                step={5}
                            />
                            <Button type="submit" size="icon">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Recurrence toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={showRecurrence ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-7 text-xs gap-1.5",
                                    recurrence !== 'none' && "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                onClick={() => setShowRecurrence(!showRecurrence)}
                            >
                                <Repeat className="w-3 h-3" />
                                {recurrence !== 'none' ? RECURRENCE_LABELS[recurrence] : 'Repetir'}
                            </Button>
                        </div>

                        {/* Recurrence options */}
                        {showRecurrence && (
                            <div className="p-3 bg-secondary/30 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-wrap gap-1.5">
                                    {(Object.keys(RECURRENCE_LABELS) as RecurrencePattern[]).map(pattern => (
                                        <Button
                                            key={pattern}
                                            type="button"
                                            variant={recurrence === pattern ? "default" : "outline"}
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setRecurrence(pattern)}
                                        >
                                            {RECURRENCE_LABELS[pattern]}
                                        </Button>
                                    ))}
                                </div>

                                {recurrence !== 'none' && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Horário:</span>
                                        <Input
                                            type="time"
                                            value={recurrenceTime}
                                            onChange={e => setRecurrenceTime(e.target.value)}
                                            className="w-24 h-7 text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                <div
                    ref={setNodeRef}
                    className={cn(
                        "flex-1 overflow-y-auto px-6 pb-6 space-y-2 min-h-[100px]",
                        isOver && "bg-primary/5"
                    )}
                >
                    {backlogTasks.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                            {isOver ? (
                                <span className="text-primary font-medium">Solte aqui para desagendar</span>
                            ) : (
                                "Adicione tarefas acima"
                            )}
                        </div>
                    )}
                    {backlogTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            className="w-full mb-0.5 shadow-none border-l-2 border-l-primary/30 hover:border-l-primary transition-all compact"
                        />
                    ))}

                    {/* Recurring Templates Section */}
                    {recurringTemplates.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                            <button
                                onClick={() => setShowRecurringSection(!showRecurringSection)}
                                className="flex items-center justify-between w-full mb-3 group"
                            >
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Repeat className="w-3 h-3" />
                                    Recorrentes ({recurringTemplates.length})
                                </h4>
                                {showRecurringSection ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>

                            {showRecurringSection && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {recurringTemplates.map(template => (
                                        <div
                                            key={template.id}
                                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/30"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Repeat className="w-3 h-3 text-primary shrink-0" />
                                                <span className="text-sm font-medium truncate">{template.title}</span>
                                                <Badge variant="outline" className="text-[10px] shrink-0">
                                                    {template.recurrence && RECURRENCE_LABELS[template.recurrence]}
                                                </Badge>
                                                {template.recurrenceTime && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {template.recurrenceTime}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => deleteRecurringTemplate(template.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {completedTasks.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Concluídas ({completedTasks.length})
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCompleted}
                                    className="h-6 text-xs text-destructive hover:text-destructive"
                                >
                                    Limpar
                                </Button>
                            </div>
                            <div className="space-y-2 opacity-60">
                                {completedTasks.slice(0, 5).map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                                {completedTasks.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                        +{completedTasks.length - 5} mais...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

