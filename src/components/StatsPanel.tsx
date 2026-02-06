import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { Target, Clock, Flame, CheckCircle2, TrendingUp } from 'lucide-react';

export const StatsPanel: React.FC = () => {
    const { stats, tasks } = useTasks();

    const scheduledTasks = tasks.filter(t => t.scheduledTime && t.status !== 'completed').length;

    const statItems = [
        {
            label: 'Concluídas today',
            value: stats.completedToday,
            suffix: 'hoje',
            icon: CheckCircle2,
            color: 'green',
            gradient: 'from-green-500/10 to-emerald-500/5',
            borderColor: 'border-green-500/10',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-600 dark:text-green-500',
            valColor: 'text-green-600 dark:text-green-400'
        },
        {
            label: 'Tempo Focado',
            value: stats.totalFocusTimeToday >= 60
                ? `${Math.floor(stats.totalFocusTimeToday / 60)}h${stats.totalFocusTimeToday % 60 > 0 ? ` ${stats.totalFocusTimeToday % 60}m` : ''}`
                : `${stats.totalFocusTimeToday}m`,
            icon: Clock,
            color: 'blue',
            gradient: 'from-blue-500/10 to-indigo-500/5',
            borderColor: 'border-blue-500/10',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-500',
            valColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Sequência',
            value: stats.streak,
            suffix: stats.streak === 1 ? 'dia' : 'dias',
            icon: Flame,
            color: 'orange',
            gradient: 'from-orange-500/10 to-amber-500/5',
            borderColor: 'border-orange-500/10',
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-600 dark:text-orange-500',
            valColor: 'text-orange-600 dark:text-orange-400'
        },
        {
            label: 'Agendadas',
            value: scheduledTasks,
            suffix: 'tarefas',
            icon: Target,
            color: 'purple',
            gradient: 'from-purple-500/10 to-violet-500/5',
            borderColor: 'border-purple-500/10',
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-600 dark:text-purple-500',
            valColor: 'text-purple-600 dark:text-purple-400'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statItems.map((item, i) => (
                <Card key={i} className={cn("relative overflow-hidden border-none shadow-soft transition-all hover:scale-[1.02] hover:-translate-y-1 group", item.gradient)}>
                    <div className={cn("absolute inset-0 border border-current opacity-[0.08]", item.borderColor)} />
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={cn("p-2 rounded-xl transition-colors group-hover:scale-110", item.iconBg)}>
                                <item.icon className={cn("w-4 h-4", item.iconColor)} />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={cn("text-3xl font-black tracking-tight", item.valColor)}>{item.value}</span>
                            {item.suffix && <span className="text-xs text-muted-foreground/70 font-medium">{item.suffix}</span>}
                        </div>
                    </CardContent>
                </Card>
            ))}
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
        <Card className="mb-8 overflow-hidden glass border-border/40 shadow-soft">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/5">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <span className="font-bold text-base block">Progresso do Dia</span>
                            <span className="text-xs text-muted-foreground font-medium">Você está {progressValue}% mais perto da meta</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="px-3 py-1 rounded-full text-xs font-bold" variant={progressValue >= 100 ? "success" : "secondary"}>
                            {stats.completedToday} / {scheduledTasks} tarefas
                        </Badge>
                        <span className="text-2xl font-black text-primary leading-none">{progressValue}%</span>
                    </div>
                </div>
                <div className="relative pt-1">
                    <Progress
                        value={progressValue}
                        className="h-3 rounded-full bg-secondary"
                        indicatorClassName={cn(
                            "transition-all duration-700 ease-out",
                            progressValue >= 100
                                ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                : progressValue >= 50
                                    ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    : "bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
                        )}
                    />
                </div>
                {progressValue >= 100 && (
                    <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20 animate-fade-in">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">🎉</div>
                        <p className="text-sm text-green-700 dark:text-green-400 font-bold">
                            Excelente trabalho! Meta do dia batida com perfeição.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
