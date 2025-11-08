import React, { useState } from 'react';
import { List, Columns, Calendar, BarChart3, Zap } from 'lucide-react';
import { WorkflowDashboard } from '../components/WorkflowDashboard';
import { KanbanView } from '../components/KanbanView';
import { CustomGanttComplete } from '../components/CustomGanttComplete';
import { TimelineView } from '../components/TimelineView';
import { SprintPlanning } from '../components/SprintPlanning';

const viewOptions = [
  { id: 'list', name: 'List', icon: List, component: WorkflowDashboard },
  { id: 'kanban', name: 'Board', icon: Columns, component: KanbanView },
  { id: 'gantt', name: 'Gantt', icon: BarChart3, component: CustomGanttComplete },
  { id: 'timeline', name: 'Timeline', icon: Calendar, component: TimelineView },
  { id: 'sprint', name: 'Sprint', icon: Zap, component: SprintPlanning }
];

export const TasksPage = () => {
  const [activeView, setActiveView] = useState('gantt');

  const ActiveComponent = viewOptions.find(v => v.id === activeView)?.component;

  return (
    <div className="h-full flex flex-col">
      <header className="flex-shrink-0 bg-background-secondary border-b border-border-default p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <div className="flex items-center gap-2 p-1 bg-background-tertiary rounded-lg">
            {viewOptions.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-background-primary text-brand-primary shadow-sm'
                      : 'text-text-secondary hover:bg-background-primary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
};
