import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Plus, Trash2, Play, CheckCircle, TrendingUp, Brain, Zap } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

export const SprintPlanning = () => {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load sprints (ignore errors if table doesn't exist)
      let sprintsData = [];
      try {
        const { data } = await supabase
          .from('sprints')
          .select('*')
          .order('start_date', { ascending: false });
        sprintsData = data || [];
      } catch (sprintError) {
        console.warn('Sprints table not available, using default velocity');
      }
      
      setSprints(sprintsData);
      
      // Find current sprint
      const now = new Date();
      const active = sprintsData?.find(s => 
        new Date(s.start_date) <= now && new Date(s.end_date) >= now
      );
      setCurrentSprint(active);
      
      // Load backlog - all PENDING tasks
      const { data: tasks } = await supabase
        .from('tasks_with_dependencies')
        .select('*')
        .eq('status', 'PENDING')
        .order('priority', { ascending: false })
        .order('phase_id');
      
      setBacklog(tasks);
      
      // Generate AI suggestions (always, even if no sprints data)
      if (tasks && tasks.length > 0) {
        generateAISuggestions(tasks, sprintsData);
      } else {
        // No tasks available - generate empty suggestions with helpful message
        setAiSuggestions({
          tasks: [],
          velocity: '5.0',
          totalHours: '0',
          maxHours: '40',
          reasoning: 'No pending tasks available for sprint planning. All tasks may be completed or in progress.'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sprint data:', error);
      // Even on error, show AI suggestions with fallback
      setAiSuggestions({
        tasks: [],
        velocity: '5.0',
        totalHours: '0',
        maxHours: '40',
        reasoning: 'Unable to load sprint data. Please check database connection.'
      });
      setLoading(false);
    }
  };

  const generateAISuggestions = (tasks, sprints) => {
    // Calculate team velocity from past sprints
    const completedSprints = sprints?.filter(s => new Date(s.end_date) < new Date()) || [];
    const totalCompleted = completedSprints.reduce((sum, s) => sum + (s.completed_tasks || 0), 0);
    const avgVelocity = completedSprints.length > 0 ? totalCompleted / completedSprints.length : 5;
    
    // AI suggests tasks for next sprint based on:
    // 1. Priority (HIGH first)
    // 2. Dependencies (unblocked tasks)
    // 3. Velocity capacity
    // 4. Complexity balance
    
    const suggested = [];
    let totalHours = 0;
    const maxHours = avgVelocity * 8; // Assume 8 hours per task
    
    // Sort by priority and readiness
    const sortedTasks = [...tasks].sort((a, b) => {
      // BLOCKED tasks last
      if (a.execution_status === 'BLOCKED' && b.execution_status !== 'BLOCKED') return 1;
      if (a.execution_status !== 'BLOCKED' && b.execution_status === 'BLOCKED') return -1;
      
      // HIGH priority first
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Lower complexity first (easier wins)
      return (a.complexity || 0) - (b.complexity || 0);
    });
    
    for (const task of sortedTasks) {
      if (task.execution_status === 'BLOCKED') continue;
      
      const taskHours = parseFloat(task.estimated_hours) || 4;
      if (totalHours + taskHours <= maxHours) {
        suggested.push(task);
        totalHours += taskHours;
      }
      
      if (suggested.length >= avgVelocity) break;
    }
    
    setAiSuggestions({
      tasks: suggested,
      velocity: avgVelocity.toFixed(1),
      totalHours: totalHours.toFixed(0),
      maxHours: maxHours.toFixed(0),
      reasoning: `Based on ${completedSprints.length} past sprints (avg ${avgVelocity.toFixed(1)} tasks/sprint)`
    });
  };

  const createSprint = async (sprintData) => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          name: sprintData.name,
          start_date: sprintData.startDate,
          end_date: sprintData.endDate,
          goal: sprintData.goal
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add suggested tasks to sprint
      if (aiSuggestions && sprintData.useAISuggestions) {
        const taskUpdates = aiSuggestions.tasks.map(t => ({
          id: t.id,
          sprint_id: data.id
        }));
        
        for (const update of taskUpdates) {
          await supabase
            .from('tasks')
            .update({ sprint_id: update.sprint_id })
            .eq('id', update.id);
        }
      }
      
      setShowCreateSprint(false);
      loadData();
    } catch (error) {
      console.error('Error creating sprint:', error);
      alert('Failed to create sprint: ' + error.message);
    }
  };

  const addTaskToSprint = async (taskId, sprintId) => {
    try {
      await supabase
        .from('tasks')
        .update({ sprint_id: sprintId })
        .eq('id', taskId);
      
      loadData();
    } catch (error) {
      console.error('Error adding task to sprint:', error);
    }
  };

  const removeTaskFromSprint = async (taskId) => {
    try {
      await supabase
        .from('tasks')
        .update({ sprint_id: null })
        .eq('id', taskId);
      
      loadData();
    } catch (error) {
      console.error('Error removing task from sprint:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-text-secondary">Loading sprint data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Sprint Planning</h1>
          <p className="text-text-secondary">Scrum-based agile workflow</p>
        </div>
        <button
          onClick={() => setShowCreateSprint(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          New Sprint
        </button>
      </div>

      {/* Current Sprint */}
      {currentSprint && (
        <div className="mb-6 bg-info-background border-2 border-info-default rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6 text-info-text" />
              <div>
                <h2 className="text-xl font-bold text-info-text">{currentSprint.name}</h2>
                <p className="text-sm text-text-secondary">{currentSprint.goal}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">
                {new Date(currentSprint.start_date).toLocaleDateString()} - {new Date(currentSprint.end_date).toLocaleDateString()}
              </div>
              <div className="text-xs text-text-tertiary">
                {Math.ceil((new Date(currentSprint.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-info-text">{currentSprint.planned_tasks || 0}</div>
              <div className="text-xs text-text-secondary">Planned</div>
            </div>
            <div className="flex-1 bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-success-text">{currentSprint.completed_tasks || 0}</div>
              <div className="text-xs text-text-secondary">Completed</div>
            </div>
            <div className="flex-1 bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-brand-text">
                {currentSprint.planned_tasks > 0 ? Math.round((currentSprint.completed_tasks / currentSprint.planned_tasks) * 100) : 0}%
              </div>
              <div className="text-xs text-text-secondary">Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions && (
        <div className="mb-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-primary">AI Sprint Suggestion</h3>
              <p className="text-sm text-text-secondary">{aiSuggestions.reasoning}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{aiSuggestions.tasks.length}</div>
              <div className="text-xs text-text-tertiary">tasks ({aiSuggestions.totalHours}h)</div>
            </div>
          </div>
          
          {/* Capacity Progress Bar */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">Sprint Capacity</span>
              <span className="text-sm font-bold text-brand-primary">
                {aiSuggestions.totalHours}/{aiSuggestions.maxHours}h ({Math.round((aiSuggestions.totalHours / aiSuggestions.maxHours) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all ${
                  (aiSuggestions.totalHours / aiSuggestions.maxHours) > 0.9 ? 'bg-error-default' :
                  (aiSuggestions.totalHours / aiSuggestions.maxHours) > 0.7 ? 'bg-warning-default' :
                  'bg-success-default'
                }`}
                style={{ width: `${Math.min((aiSuggestions.totalHours / aiSuggestions.maxHours) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-success-default" />
                <span className="text-xs text-text-secondary">Velocity</span>
              </div>
              <div className="text-lg font-bold text-text-primary">{aiSuggestions.velocity} tasks/sprint</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-warning-default" />
                <span className="text-xs text-text-secondary">Tasks</span>
              </div>
              <div className="text-lg font-bold text-text-primary">{aiSuggestions.tasks.length} suggested</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-info-default" />
                <span className="text-xs text-text-secondary">Ready</span>
              </div>
              <div className="text-lg font-bold text-text-primary">{aiSuggestions.tasks.filter(t => t.execution_status === 'READY').length}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-text-primary">Suggested Tasks:</h4>
            {aiSuggestions.tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  task.priority === 'HIGH' ? 'bg-error-background text-error-text' :
                  task.priority === 'MEDIUM' ? 'bg-warning-background text-warning-text' :
                  'bg-success-background text-success-text'
                }`}>
                  {task.priority}
                </span>
                <span className="flex-1 text-sm text-text-primary truncate">#{task.id} {task.name}</span>
                <span className="text-xs text-text-tertiary">{task.estimated_hours}h</span>
              </div>
            ))}
            {aiSuggestions.tasks.length > 5 && (
              <div className="text-xs text-text-tertiary text-center">
                +{aiSuggestions.tasks.length - 5} more tasks
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Backlog */}
      <div className="bg-background-secondary rounded-xl border border-border-default p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Product Backlog ({backlog.length})</h3>
        <div className="space-y-2">
          {backlog.slice(0, 10).map(task => (
            <div 
              key={task.id} 
              className="flex items-center gap-3 bg-background-tertiary rounded-lg p-3 hover:bg-background-primary transition cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className={`w-1 h-12 rounded ${
                task.priority === 'HIGH' ? 'bg-error-default' :
                task.priority === 'MEDIUM' ? 'bg-warning-default' :
                'bg-success-default'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-text-tertiary">#{task.id}</span>
                  <span className="text-sm font-semibold text-text-primary truncate">{task.name}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-text-tertiary">Phase {task.phase_id}</span>
                  {task.complexity && <span className="text-text-tertiary">C:{task.complexity}</span>}
                  {task.estimated_hours && <span className="text-text-tertiary">⏱️ {task.estimated_hours}h</span>}
                </div>
              </div>
              {task.execution_status === 'BLOCKED' && (
                <span className="px-2 py-1 bg-error-background text-error-text text-xs rounded">BLOCKED</span>
              )}
            </div>
          ))}
          {backlog.length > 10 && (
            <div className="text-center text-sm text-text-tertiary py-2">
              +{backlog.length - 10} more tasks in backlog
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <CreateSprintModal
          onClose={() => setShowCreateSprint(false)}
          onCreate={createSprint}
          aiSuggestions={aiSuggestions}
        />
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

const CreateSprintModal = ({ onClose, onCreate, aiSuggestions }) => {
  const [formData, setFormData] = useState({
    name: `Sprint ${new Date().toISOString().slice(0, 10)}`,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    goal: '',
    useAISuggestions: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background-secondary rounded-xl shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Create New Sprint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Sprint Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Sprint Goal</label>
            <textarea
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
              rows="3"
              placeholder="What do you want to achieve in this sprint?"
            />
          </div>
          {aiSuggestions && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useAISuggestions}
                  onChange={e => setFormData({...formData, useAISuggestions: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm text-text-primary">
                  Use AI suggested tasks ({aiSuggestions.tasks.length} tasks, {aiSuggestions.totalHours}h)
                </span>
              </label>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border-default rounded-lg hover:bg-background-tertiary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition"
            >
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
