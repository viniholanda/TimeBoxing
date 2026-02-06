import React, { useState } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { BacklogPanel } from './components/BacklogPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { TaskCard } from './components/TaskCard';
import { ThemeToggle } from './components/ThemeToggle';
import { StatsPanel, ProgressCard } from './components/StatsPanel';
import { type Task } from './types/task';
import { Calendar } from 'lucide-react';
import './index.css';

const AppContent: React.FC = () => {
  const { scheduleTask, unscheduleTask } = useTasks();
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragTask(event.active.data.current?.task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    const overId = over.id.toString();
    const taskId = active.id.toString();

    // Dropped on a time slot (Timeline)
    if (overId.includes(':')) {
      scheduleTask(taskId, overId);
    }
    // Dropped on backlog area
    else if (overId === 'backlog-droppable') {
      unscheduleTask(taskId);
    }
  };

  // Get current date formatted
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  const formattedDate = today.toLocaleDateString('pt-BR', dateOptions);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">TimeBoxing</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Focus & Productivity</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium capitalize">{formattedDate}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex-1 overflow-visible py-8">
          <div className="container mx-auto px-4 max-w-7xl animate-fade-in">
            {/* Stats Dashboard */}
            <StatsPanel />
            <ProgressCard />

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
              <div className="md:col-span-4 lg:col-span-3 min-h-[400px] md:h-[calc(100vh-380px)]">
                <BacklogPanel />
              </div>
              <div className="md:col-span-8 lg:col-span-9 min-h-[400px] md:h-[calc(100vh-380px)]">
                <TimelinePanel />
              </div>
            </div>
          </div>
        </main>

        <DragOverlay>
          {activeDragTask ? <TaskCard task={activeDragTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>


    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  );
};

export default App;
