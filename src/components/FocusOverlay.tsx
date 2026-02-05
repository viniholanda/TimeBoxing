import React, { useEffect, useState, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { Button } from './ui/button';
import { Play, Pause, Square, Check, Volume2, VolumeX } from 'lucide-react';
import { playCompletionSound, playWarningSound } from '../lib/sounds';


export const FocusOverlay: React.FC = () => {
    const { activeTask, stopTask, completeTask } = useTasks();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const hasPlayedWarning = useRef(false);
    const hasPlayedCompletion = useRef(false);

    useEffect(() => {
        if (activeTask) {
            setTimeLeft(activeTask.duration * 60); // convert minutes to seconds
            setIsPaused(false);
            hasPlayedWarning.current = false;
            hasPlayedCompletion.current = false;
        }
    }, [activeTask]);

    useEffect(() => {
        if (!activeTask || isPaused) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0; // Timer finished
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTask, isPaused]);

    // Sound notifications
    useEffect(() => {
        if (!soundEnabled || !activeTask) return;

        // Warning sound at 1 minute remaining
        if (timeLeft === 60 && !hasPlayedWarning.current) {
            playWarningSound();
            hasPlayedWarning.current = true;
        }

        // Completion sound when timer reaches 0
        if (timeLeft === 0 && !hasPlayedCompletion.current) {
            playCompletionSound();
            hasPlayedCompletion.current = true;
        }
    }, [timeLeft, soundEnabled, activeTask]);

    if (!activeTask) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isTimeUp = timeLeft === 0;

    return (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isTimeUp ? 'bg-green-500/20' : 'bg-background/95'}`}>
            <div className="max-w-2xl w-full text-center space-y-12">
                {/* Sound toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>

                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        {isTimeUp ? 'Time\'s Up!' : 'Now Focusing On'}
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">{activeTask.title}</h1>
                </div>

                <div className={`text-[8rem] md:text-[12rem] font-bold font-mono leading-none tracking-tighter tabular-nums selection:bg-primary/20 transition-colors ${isTimeUp ? 'text-green-600 animate-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center justify-center gap-6">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="h-16 w-16 rounded-full"
                        onClick={stopTask} // Using stopTask as "Abort/Exit"
                    >
                        <Square className="w-6 h-6 fill-current" />
                    </Button>

                    {!isTimeUp && (
                        <Button
                            size="lg"
                            className="h-24 w-24 rounded-full text-2xl shadow-2xl shadow-primary/20"
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? <Play className="w-10 h-10 ml-1 fill-current" /> : <Pause className="w-10 h-10 fill-current" />}
                        </Button>
                    )}

                    <Button
                        size="lg"
                        variant="default"
                        className={`h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white border-none ring-offset-background transition-all ${isTimeUp ? 'h-24 w-24 animate-bounce' : ''}`}
                        onClick={() => completeTask(activeTask.id)}
                    >
                        <Check className={isTimeUp ? 'w-10 h-10' : 'w-8 h-8'} />
                    </Button>
                </div>

                {isTimeUp && (
                    <p className="text-lg text-muted-foreground animate-fade-in">
                        Great job! Click the checkmark to complete this task.
                    </p>
                )}
            </div>
        </div>
    );
};

