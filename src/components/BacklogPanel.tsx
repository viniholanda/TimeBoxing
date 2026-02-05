import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export const BacklogPanel: React.FC = () => {
    const { tasks, addTask, clearCompleted } = useTasks();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('30');

    // Make backlog a droppable area
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog-droppable',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            addTask(title, parseInt(duration) || 30);
            setTitle('');
        }
    };

    const backlogTasks = tasks.filter(t => !t.scheduledTime && t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="flex flex-col h-full gap-4">
            <Card className={cn(
                "flex-1 flex flex-col border shadow-sm transition-all",
                isOver && "ring-2 ring-primary/50 bg-primary/5"
            )}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Inbox className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-base">Backlog</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {backlogTasks.length}
                        </Badge>
                    </div>
                </CardHeader>

                <div className="px-6 pb-4">
                    <form onSubmit={handleAdd} className="flex gap-2">
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
                        <TaskCard key={task.id} task={task} />
                    ))}

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
