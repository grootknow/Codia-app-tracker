import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, AlertCircle, ChevronRight, ChevronDown, User, Bot } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
import { UnifiedFilterBar } from './UnifiedFilterBar';

export const TimelineView = () => {
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('timeline_data')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        loadData
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadData = async () => {
    try {
      const [phasesRes, tasksRes] = await Promise.all([
        supabase
          .from('phases')
          .select('*')
          .order('order_index'),
        supabase
          .from('tasks_with_dependencies')
          .select('*')
          .order('phase_id')
          .order('order_index')
      ]);

      if (phasesRes.error) throw phasesRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const phasesData = phasesRes.data || [];
      setPhases(phasesData);
      setTasks(tasksRes.data || []);
      
      // Expand all phases by default for better UX
      setExpandedPhases(new Set(phasesData.map(p => p.id)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseStatus = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phase_id === phaseId);
    if (phaseTasks.length === 0) return 'PENDING';
    
    const allDone = phaseTasks.every(t => t.status === 'DONE');
    const anyInProgress = phaseTasks.some(t => t.status === 'IN_PROGRESS');
    
    if (allDone) return 'DONE';
    if (anyInProgress) return 'IN_PROGRESS';
    return 'PENDING';
  };

  const getPhaseProgress = (phaseId) => {
    const phaseTasks = tasks.filter(t => t.phase_id === phaseId);
    if (phaseTasks.length === 0) return 0;
    
    const doneCount = phaseTasks.filter(t => t.status === 'DONE').length;
    return (doneCount / phaseTasks.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPhase !== 'all' && task.phase_id !== parseInt(filterPhase)) {
      return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = searchQuery || filterPhase !== 'all' || filterPriority !== 'all' || filterStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPhase('all');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  return (
    <div className="h-full flex flex-col bg-background-primary">
      <div className="flex-shrink-0 p-4">
        <UnifiedFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterPhase={filterPhase}
          onPhaseChange={setFilterPhase}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          phases={phases}
          showClearButton={hasActiveFilters}
          onClearFilters={clearFilters}
          resultCount={filteredTasks.length}
          totalCount={tasks.length}
        />
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-2">🗓️ Project Timeline</h1>
            <p className="text-text-secondary">Phase-by-phase roadmap</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-border-default"></div>

            {/* Phases */}
            <div className="space-y-12">
              {phases.map((phase, idx) => {
                const status = getPhaseStatus(phase.id);
                const progress = getPhaseProgress(phase.id);
                const phaseTasks = filteredTasks.filter(t => t.phase_id === phase.id);
              const doneCount = phaseTasks.filter(t => t.status === 'DONE').length;
              const inProgressCount = phaseTasks.filter(t => t.status === 'IN_PROGRESS').length;

              return (
                <div key={phase.id} className="relative pl-20">
                  {/* Phase Marker */}
                  <div className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center text-text-onPrimary font-bold text-xl shadow-lg ${
                    status === 'DONE' ? 'bg-success-default' :
                    status === 'IN_PROGRESS' ? 'bg-info-default animate-pulse' :
                    'bg-text-tertiary'
                  }`}>
                    {status === 'DONE' ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : status === 'IN_PROGRESS' ? (
                      <Clock className="w-8 h-8" />
                    ) : (
                      phase.id
                    )}
                  </div>

                  {/* Phase Card */}
                  <div className="bg-background-secondary rounded-xl shadow-md p-6 border border-border-default hover:shadow-lg hover:border-brand-primary transition-all cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedPhases);
                      if (newExpanded.has(phase.id)) {
                        newExpanded.delete(phase.id);
                      } else {
                        newExpanded.add(phase.id);
                      }
                      setExpandedPhases(newExpanded);
                    }}
                  >
                    {/* Phase Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="mr-3">
                        {expandedPhases.has(phase.id) ? 
                          <ChevronDown className="w-6 h-6 text-brand-primary" /> : 
                          <ChevronRight className="w-6 h-6 text-text-tertiary" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-text-primary">{phase.name}</h2>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            status === 'DONE' ? 'bg-success-background text-success-text' :
                            status === 'IN_PROGRESS' ? 'bg-info-background text-info-text' :
                            'bg-background-tertiary text-text-secondary'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-text-secondary">{phase.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-brand-primary">{progress.toFixed(0)}%</div>
                        <div className="text-sm text-text-tertiary">{doneCount}/{phaseTasks.length} tasks</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4 group relative">
                      <div className="w-full bg-background-tertiary rounded-full h-4 cursor-pointer">
                        <div
                          className={`h-4 rounded-full transition-all ${
                            status === 'DONE' ? 'bg-success-default' :
                            status === 'IN_PROGRESS' ? 'bg-info-default' :
                            'bg-text-tertiary'
                          }`}
                          style={{ width: `${progress}%` }}
                          title={`${doneCount}/${phaseTasks.length} tasks complete`}
                        />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background-primary border border-border-default px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm">
                        {doneCount}/{phaseTasks.length} tasks ({progress.toFixed(1)}%)
                      </div>
                    </div>

                    {/* Task Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-success-background rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-success-text">{doneCount}</div>
                        <div className="text-xs text-text-secondary">Completed</div>
                      </div>
                      <div className="bg-info-background rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-info-text">{inProgressCount}</div>
                        <div className="text-xs text-text-secondary">In Progress</div>
                      </div>
                      <div className="bg-background-tertiary rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-text-secondary">
                          {phaseTasks.length - doneCount - inProgressCount}
                        </div>
                        <div className="text-xs text-text-secondary">Pending</div>
                      </div>
                    </div>

                    {/* Key Tasks Preview */}
                    {inProgressCount > 0 && (
                      <div className="bg-info-background rounded-lg p-3 border border-info-default/30">
                        <h4 className="font-bold text-sm text-info-text mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Currently Working On:
                        </h4>
                        <div className="space-y-1">
                          {phaseTasks
                            .filter(t => t.status === 'IN_PROGRESS')
                            .slice(0, 3)
                            .map(task => (
                              <div 
                                key={task.id} 
                                className="text-sm text-text-secondary flex items-center gap-2 hover:bg-info-default/10 p-1 rounded cursor-pointer transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTask(task);
                                }}
                              >
                                <ChevronRight className="w-3 h-3 text-info-default" />
                                {task.assigned_type === 'HUMAN' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                <span className="font-semibold">#{task.id}</span>
                                <span className="truncate">{task.name}</span>
                                {task.progress_percentage !== null && (
                                  <span className="ml-auto text-xs text-info-text font-bold">
                                    {task.progress_percentage}%
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Tasks List */}
                    {expandedPhases.has(phase.id) && (
                      <div className="mt-4 space-y-2 border-t border-border-default pt-4" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-bold text-sm text-text-primary mb-2">All Tasks in Phase:</h4>
                        {phaseTasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-background-tertiary cursor-pointer transition"
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === 'DONE' ? 'bg-success-default' :
                              task.status === 'IN_PROGRESS' ? 'bg-info-default' :
                              task.status === 'BLOCKED' ? 'bg-error-default' :
                              'bg-text-tertiary'
                            }`} />
                            {task.assigned_type === 'HUMAN' ? 
                              <User className="w-4 h-4 text-purple-600" /> : 
                              <Bot className="w-4 h-4 text-green-600" />
                            }
                            <span className="text-xs text-text-tertiary">#{task.id}</span>
                            <span className="flex-1 text-sm text-text-primary">{task.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.status === 'DONE' ? 'bg-success-background text-success-text' :
                              task.status === 'IN_PROGRESS' ? 'bg-info-background text-info-text' :
                              task.status === 'BLOCKED' ? 'bg-error-background text-error-text' :
                              'bg-background-tertiary text-text-secondary'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="mt-4 flex gap-4 text-xs text-text-tertiary">
                      {phase.start_date && (
                        <div>
                          <span className="font-semibold">Start:</span> {new Date(phase.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {phase.end_date && (
                        <div>
                          <span className="font-semibold">Target:</span> {new Date(phase.end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  {idx < phases.length - 1 && (
                    <div className="absolute left-8 -bottom-6 flex items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-border-default transform rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-12 bg-background-secondary rounded-xl shadow-md border border-border-default p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-text-primary">🎯 Overall Project Status</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold text-brand-primary">{phases.length}</div>
              <div className="text-sm text-text-secondary">Total Phases</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-default">
                {phases.filter(p => getPhaseStatus(p.id) === 'DONE').length}
              </div>
              <div className="text-sm text-text-secondary">Completed Phases</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-text-primary">{tasks.length}</div>
              <div className="text-sm text-text-secondary">Total Tasks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary">
                {tasks.length > 0 ? ((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-text-secondary">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          allTasks={tasks}
          onClose={() => setSelectedTask(null)} 
          onUpdate={loadData}
        />
      )}
    </div>
  );
};
