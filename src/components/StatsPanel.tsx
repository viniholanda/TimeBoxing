import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Target, Clock, Flame, CheckCircle2, TrendingUp } from 'lucide-react';

export const StatsPanel: React.FC = () => {
    const { stats, tasks } = useTasks();

    const scheduledTasks = tasks.filter(t => t.scheduledTime && t.status !== 'completed').length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Completed Today */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-200/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Concluídas</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-green-600">{stats.completedToday}</span>
                        <span className="text-sm text-muted-foreground">hoje</span>
                    </div>
                </CardContent>
            </Card>

            {/* Focus Time */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-200/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Tempo Focado</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-blue-600">
                            {stats.totalFocusTimeToday >= 60
                                ? `${Math.floor(stats.totalFocusTimeToday / 60)}h${stats.totalFocusTimeToday % 60 > 0 ? ` ${stats.totalFocusTimeToday % 60}m` : ''}`
                                : `${stats.totalFocusTimeToday}m`
                            }
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Streak */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-200/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Flame className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Sequência</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-orange-600">{stats.streak}</span>
                        <span className="text-sm text-muted-foreground">{stats.streak === 1 ? 'dia' : 'dias'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Scheduled */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-200/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Agendadas</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-purple-600">{scheduledTasks}</span>
                        <span className="text-sm text-muted-foreground">tarefas</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const ProgressCard: React.FC = () => {
    const { stats, tasks } = useTasks();

    const scheduledTasks = tasks.filter(t => t.scheduledTime).length;
    const progressValue = scheduledTasks > 0
        ? Math.round((stats.completedToday / scheduledTasks) * 100)
        : 0;

    if (scheduledTasks === 0) return null;

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Progresso do Dia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={progressValue >= 100 ? "success" : progressValue >= 50 ? "secondary" : "outline"}>
                            {stats.completedToday} / {scheduledTasks}
                        </Badge>
                        <span className="text-sm font-bold text-primary">{progressValue}%</span>
                    </div>
                </div>
                <Progress
                    value={progressValue}
                    className="h-2"
                    indicatorClassName={
                        progressValue >= 100
                            ? "bg-green-500"
                            : progressValue >= 50
                                ? "bg-blue-500"
                                : "bg-primary"
                    }
                />
                {progressValue >= 100 && (
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Parabéns! Você completou todas as tarefas de hoje! 🎉
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
