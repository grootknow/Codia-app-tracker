import React, { useState } from 'react';
import { List, Columns, Calendar, BarChart3 } from 'lucide-react';
import { WorkflowDashboard } from './WorkflowDashboard';
import { KanbanView } from './KanbanView';
import { CustomGanttPro } from './CustomGanttPro';
import { TimelineView } from './TimelineView';

export const TasksView = () => {
  const [activeView, setActiveView] = useState('gantt'); // list, kanban, gantt, timeline - Default to Gantt

  const views = [
    { id: 'list', name: 'List', icon: List, component: WorkflowDashboard },
    { id: 'kanban', name: 'Board', icon: Columns, component: KanbanView },
    { id: 'gantt', name: 'Gantt', icon: BarChart3, component: CustomGanttPro },
    { id: 'timeline', name: 'Timeline', icon: Calendar, component: TimelineView }
  ];

  const ActiveComponent = views.find(v => v.id === activeView)?.component;

  const buttonBaseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200";
  const activeButtonClasses = "bg-brand-primary/10 text-brand-primary font-semibold";
  const inactiveButtonClasses = "text-text-secondary hover:bg-background-tertiary hover:text-text-primary";

  return (
    <div className="h-full flex flex-col bg-background-primary">
      {/* Modern View Switcher */}
      <div className="flex items-center gap-4 px-6 py-2 border-b border-border-subtle bg-background-secondary">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">View:</span>
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`${buttonBaseClasses} ${
                activeView === view.id ? activeButtonClasses : inactiveButtonClasses
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active View */}
      <div className="flex-1 overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};
