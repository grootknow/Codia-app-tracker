import React, { useState, useEffect } from 'react';
import { supabase, getGapAnalysis } from '../lib/supabase';
import { TrendingUp, Clock, Target, AlertTriangle, User, Bot, CheckCircle, Zap, ChevronRight } from 'lucide-react';
import { AIActivityStream } from './AIActivityStream';
import { TaskDetailModal } from './TaskDetailModal';
import { AIAnalysisPanel } from './AIAnalysisPanel';

export const GapDashboard = () => {
  const [stats, setStats] = useState(null);
  const [phaseStats, setPhaseStats] = useState([]);
  const [humanTasks, setHumanTasks] = useState([]);
  const [aiTasks, setAiTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadStats();
    
    // Real-time subscription
    const subscription = supabase
      .channel('gap-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadStats)
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);

  const loadStats = async () => {
    try {
      // Load recommended tasks - get more for better grouping
      const { data: humanData } = await supabase
        .rpc('get_next_recommended_tasks', { 
          for_agent_type: 'HUMAN',
          limit_count: 10
        });
      
      // Group by phase
      const humanGrouped = (humanData || []).reduce((acc, task) => {
        const phase = `Phase ${task.phase_id}`;
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(task);
        return acc;
      }, {});
      setHumanTasks(humanGrouped);

      const { data: aiData } = await supabase
        .rpc('get_next_recommended_tasks', { 
          for_agent_type: 'AI',
          limit_count: 10
        });
      
      // Group by phase
      const aiGrouped = (aiData || []).reduce((acc, task) => {
        const phase = `Phase ${task.phase_id}`;
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(task);
        return acc;
      }, {});
      setAiTasks(aiGrouped);

      // Overall stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, phase_id, assigned_type, estimated_hours, actual_hours');
      
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'DONE').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;
      const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
      
      const completionPct = ((done / total) * 100).toFixed(2);
      const gapPct = (((total - done) / total) * 100).toFixed(2);
      
      const filteredHumanTasks = tasks.filter(t => t.assigned_type === 'HUMAN');
      const filteredAiTasks = tasks.filter(t => t.assigned_type === 'AI');
      
      const totalEstHours = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
      const totalActualHours = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);
      
      setStats({
        total,
        done,
        inProgress,
        pending,
        blocked,
        completionPct,
        gapPct,
        humanTasks: filteredHumanTasks.length,
        aiTasks: filteredAiTasks.length,
        totalEstHours: totalEstHours.toFixed(1),
        totalActualHours: totalActualHours.toFixed(1)
      });
      
      // Phase stats
      const { data: phases } = await supabase
        .from('phases')
        .select('*')
        .order('order_index');
      
      const phaseData = await Promise.all(
        phases.map(async (phase) => {
          const { data: phaseTasks } = await supabase
            .from('tasks')
            .select('status')
            .eq('phase_id', phase.id);
          
          const total = phaseTasks.length;
          const done = phaseTasks.filter(t => t.status === 'DONE').length;
          const pct = total > 0 ? ((done / total) * 100).toFixed(1) : 0;
          
          return {
            ...phase,
            totalTasks: total,
            doneTasks: done,
            completionPct: pct
          };
        })
      );
      
      setPhaseStats(phaseData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-error-background text-error-text border-error-default/30';
      case 'MEDIUM': return 'bg-warning-background text-warning-text border-warning-default/30';
      case 'LOW': return 'bg-success-background text-success-text border-success-default/30';
      default: return 'bg-background-tertiary text-text-secondary border-border-default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return '🔥';
      case 'MEDIUM': return '⚡';
      case 'LOW': return '📌';
      default: return '•';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background-primary">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-background-secondary border border-border-default rounded-xl shadow-sm p-6">
          <h2 className="text-3xl font-bold text-text-primary mb-2">📊 GAP Analysis Dashboard</h2>
          <p className="text-text-secondary">Real-time project health and performance metrics</p>
        </div>

      {/* Next Recommended Tasks */}
      <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
            <ChevronRight className="w-8 h-8 text-text-onPrimary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-primary">🎯 Next Tasks - Execute Now!</h3>
            <p className="text-sm text-text-secondary">READY to start - No blocking dependencies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Human Tasks */}
          <div className="bg-background-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-text-primary" />
              <h4 className="font-bold text-lg text-text-primary">👤 Founder</h4>
              <span className="ml-auto text-sm bg-background-tertiary text-text-primary px-3 py-1 rounded-full font-bold">
                {Object.values(humanTasks).flat().length} ready
              </span>
            </div>
            <div className="space-y-4">
              {Object.keys(humanTasks).length > 0 ? (
                Object.keys(humanTasks).sort((a, b) => {
                  const phaseA = parseInt(a.split(' ')[1]);
                  const phaseB = parseInt(b.split(' ')[1]);
                  return phaseA - phaseB;
                }).map((phase) => (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border-default">
                      <div className="w-6 h-6 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-bold text-text-primary">
                        {phase.split(' ')[1]}
                      </div>
                      <h5 className="font-bold text-sm text-text-primary">{phase}</h5>
                      <span className="ml-auto text-xs bg-background-tertiary px-2 py-0.5 rounded text-text-secondary">
                        {humanTasks[phase].length} tasks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {humanTasks[phase].map((task, idx) => (
                        <div key={task.task_id} className="bg-background-primary border border-border-default rounded-lg p-3 relative">
                          {idx === 0 && (
                            <div className="absolute -left-1.5 top-3 w-3 h-3 bg-success-default rounded-full border-2 border-background-secondary shadow-lg"></div>
                          )}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-text-tertiary">#{task.task_id}</span>
                              {idx === 0 && (
                                <span className="text-xs bg-success-default text-text-onPrimary px-2 py-0.5 rounded font-bold">
                                  ▶ DO FIRST
                                </span>
                              )}
                            </div>
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)} {task.priority}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm mb-1 text-text-primary">{task.task_name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            {task.complexity && <span>Complexity: {task.complexity}/5</span>}
                            {task.estimated_hours && <span>• ~{task.estimated_hours}h</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-text-tertiary">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All done or blocked!</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Tasks */}
          <div className="bg-background-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-text-primary" />
              <h4 className="font-bold text-lg text-text-primary">🤖 AI Agent</h4>
              <span className="ml-auto text-sm bg-background-tertiary text-text-primary px-3 py-1 rounded-full font-bold">
                {Object.values(aiTasks).flat().length} ready
              </span>
            </div>
            <div className="space-y-4">
              {Object.keys(aiTasks).length > 0 ? (
                Object.keys(aiTasks).sort((a, b) => {
                  const phaseA = parseInt(a.split(' ')[1]);
                  const phaseB = parseInt(b.split(' ')[1]);
                  return phaseA - phaseB;
                }).map((phase) => (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border-default">
                      <div className="w-6 h-6 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-bold text-text-primary">
                        {phase.split(' ')[1]}
                      </div>
                      <h5 className="font-bold text-sm text-text-primary">{phase}</h5>
                      <span className="ml-auto text-xs bg-background-tertiary px-2 py-0.5 rounded text-text-secondary">
                        {aiTasks[phase].length} tasks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {aiTasks[phase].map((task, idx) => (
                        <div 
                          key={task.task_id} 
                          className="bg-background-primary border border-border-default rounded-lg p-3 relative cursor-pointer hover:shadow-lg hover:border-brand-primary transition"
                          onClick={() => setSelectedTask(task)}
                        >
                          {idx === 0 && (
                            <div className="absolute -left-1.5 top-3 w-3 h-3 bg-success-default rounded-full border-2 border-background-secondary shadow-lg"></div>
                          )}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-text-tertiary">#{task.task_id}</span>
                              {idx === 0 && (
                                <span className="text-xs bg-success-default text-text-onPrimary px-2 py-0.5 rounded font-bold">
                                  ▶ DO FIRST
                                </span>
                              )}
                            </div>
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)} {task.priority}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm mb-1 text-text-primary">{task.task_name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            {task.complexity && <span>Complexity: {task.complexity}/5</span>}
                            {task.estimated_hours && <span>• ~{task.estimated_hours}h</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-text-tertiary">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All done or blocked!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-success-background border border-success-default/30 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-text text-sm font-semibold">Completed</p>
                <p className="text-4xl font-bold text-success-text mt-2">{stats.done}</p>
                <p className="text-xs text-success-text/70 mt-1">{stats.completionPct}% done</p>
              </div>
              <Target className="w-14 h-14 text-success-default opacity-20" />
            </div>
          </div>

          <div className="bg-info-background border border-info-default/30 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-info-text text-sm font-semibold">In Progress</p>
                <p className="text-4xl font-bold text-info-text mt-2">{stats.inProgress}</p>
                <p className="text-xs text-info-text/70 mt-1">Active tasks</p>
              </div>
              <Clock className="w-14 h-14 text-info-default opacity-30" />
            </div>
          </div>

          <div className="bg-warning-background border border-warning-default/30 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-text text-sm font-semibold">Pending</p>
                <p className="text-4xl font-bold text-warning-text mt-2">{stats.pending}</p>
                <p className="text-xs text-warning-text/70 mt-1">Not started</p>
              </div>
              <TrendingUp className="w-14 h-14 text-warning-default opacity-30" />
            </div>
          </div>

          <div className="bg-error-background border border-error-default/30 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-error-text text-sm font-semibold">🚨 GAP</p>
                <p className="text-4xl font-bold text-error-text mt-2">{stats.gapPct}%</p>
                <p className="text-xs text-error-text/70 mt-1">{stats.total - stats.done} tasks left</p>
              </div>
              <AlertTriangle className="w-14 h-14 text-error-default opacity-30" />
            </div>
          </div>
        </div>

      {/* Progress bar */}
      <div className="bg-background-secondary rounded-xl shadow-sm border border-border-default p-6">
        <h3 className="font-bold text-lg mb-4 text-text-primary">Overall Progress</h3>
        <div className="relative">
          <div className="h-8 bg-background-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500"
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
            {stats.done} / {stats.total} tasks ({stats.completionPct}%)
          </div>
        </div>
      </div>

      {/* Assignee breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background-secondary rounded-xl shadow-sm border border-border-default p-6">
          <h3 className="font-bold text-lg mb-4 text-text-primary">👤 Human Tasks</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-brand-primary">{stats.humanTasks}</p>
            <p className="text-sm text-text-secondary mt-2">Tasks assigned to founders</p>
          </div>
        </div>

        <div className="bg-background-secondary rounded-xl shadow-sm border border-border-default p-6">
          <h3 className="font-bold text-lg mb-4 text-text-primary">🤖 AI Agent Tasks</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-info-default">{stats.aiTasks}</p>
            <p className="text-sm text-text-secondary mt-2">Tasks assigned to AI agents</p>
          </div>
        </div>
      </div>

      {/* Time tracking */}
      <div className="bg-background-secondary rounded-xl shadow-sm border border-border-default p-6">
        <h3 className="font-bold text-lg mb-4 text-text-primary">⏱️ Time Tracking</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-text-secondary text-sm">Estimated Hours</p>
            <p className="text-3xl font-bold text-warning-text">{stats.totalEstHours}h</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Actual Hours (so far)</p>
            <p className="text-3xl font-bold text-success-text">{stats.totalActualHours}h</p>
          </div>
        </div>
      </div>

      {/* Next Recommended Tasks - Smart Sorting */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <ChevronRight className="w-8 h-8" />
          <div>
            <h3 className="text-2xl font-bold">🎯 Next Tasks - Execute Now!</h3>
            <p className="text-sm opacity-90">READY to start - No blocking dependencies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Human Tasks */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              <h4 className="font-bold text-lg">👤 Founder</h4>
              <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full font-bold">
                {Object.values(humanTasks).flat().length} ready
              </span>
            </div>
            <div className="space-y-4">
              {Object.keys(humanTasks).length > 0 ? (
                Object.keys(humanTasks).sort((a, b) => {
                  const phaseA = parseInt(a.split(' ')[1]);
                  const phaseB = parseInt(b.split(' ')[1]);
                  return phaseA - phaseB;
                }).map((phase) => (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-white/30">
                      <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                        {phase.split(' ')[1]}
                      </div>
                      <h5 className="font-bold text-sm">{phase}</h5>
                      <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
                        {humanTasks[phase].length} tasks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {humanTasks[phase].map((task, idx) => (
                        <div 
                          key={task.task_id} 
                          className="bg-white rounded-lg p-3 text-gray-800 relative cursor-pointer hover:shadow-lg transition"
                          onClick={() => setSelectedTask(task)}
                        >
                          {idx === 0 && (
                            <div className="absolute -left-2 top-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                          )}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">#{task.task_id}</span>
                              {idx === 0 && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-bold">
                                  ▶ DO FIRST
                                </span>
                              )}
                            </div>
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                                task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border-red-300' :
                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                'bg-green-100 text-green-700 border-green-300'
                              }`}>
                                {task.priority === 'HIGH' ? '🔥' : task.priority === 'MEDIUM' ? '⚡' : '📌'} {task.priority}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm mb-1">{task.task_name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {task.complexity && <span>Complexity: {task.complexity}/5</span>}
                            {task.estimated_hours && <span>• ~{task.estimated_hours}h</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-white/70">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All done or blocked!</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Tasks */}
          <div className="bg-background-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-text-primary" />
              <h4 className="font-bold text-lg text-text-primary">🤖 AI Agent</h4>
              <span className="ml-auto text-sm bg-background-tertiary text-text-primary px-3 py-1 rounded-full font-bold">
                {Object.values(aiTasks).flat().length} ready
              </span>
            </div>
            <div className="space-y-4">
              {Object.keys(aiTasks).length > 0 ? (
                Object.keys(aiTasks).sort((a, b) => {
                  const phaseA = parseInt(a.split(' ')[1]);
                  const phaseB = parseInt(b.split(' ')[1]);
                  return phaseA - phaseB;
                }).map((phase) => (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border-default">
                      <div className="w-6 h-6 rounded-full bg-background-tertiary flex items-center justify-center text-xs font-bold text-text-primary">
                        {phase.split(' ')[1]}
                      </div>
                      <h5 className="font-bold text-sm text-text-primary">{phase}</h5>
                      <span className="ml-auto text-xs bg-background-tertiary px-2 py-0.5 rounded text-text-secondary">
                        {aiTasks[phase].length} tasks
                      </span>
                    </div>
                    <div className="space-y-2">
                      {aiTasks[phase].map((task, idx) => (
                        <div 
                          key={task.task_id} 
                          className="bg-background-primary border border-border-default rounded-lg p-3 relative cursor-pointer hover:shadow-lg hover:border-brand-primary transition"
                          onClick={() => setSelectedTask(task)}
                        >
                          {idx === 0 && (
                            <div className="absolute -left-1.5 top-3 w-3 h-3 bg-success-default rounded-full border-2 border-background-secondary shadow-lg"></div>
                          )}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-text-tertiary">#{task.task_id}</span>
                              {idx === 0 && (
                                <span className="text-xs bg-success-default text-text-onPrimary px-2 py-0.5 rounded font-bold">
                                  ▶ DO FIRST
                                </span>
                              )}
                            </div>
                            {task.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)} {task.priority}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm mb-1 text-text-primary">{task.task_name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            {task.complexity && <span>Complexity: {task.complexity}/5</span>}
                            {task.estimated_hours && <span>• ~{task.estimated_hours}h</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-text-tertiary">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All done or blocked!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <AIAnalysisPanel tasks={[]} onRecommendationApply={() => {}} />

      {/* Phase breakdown */}
      <div className="bg-background-secondary rounded-xl shadow-sm border border-border-default p-6">
        <h3 className="font-bold text-lg mb-4 text-text-primary">📋 Progress by Phase</h3>
        <div className="space-y-4">
          {phaseStats.map(phase => (
            <div key={phase.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-text-secondary">{phase.name}</span>
                <span className="text-sm text-text-tertiary">
                  {phase.doneTasks}/{phase.totalTasks} ({phase.completionPct}%)
                </span>
              </div>
              <div className="h-4 bg-background-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-500"
                  style={{ width: `${phase.completionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={allTasks}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadStats}
        />
      )}
      </div>
    </div>
  );
};
