import React, { useState } from 'react';
import { X, User, Bot, Clock, TrendingUp, ArrowRight, Shield, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { validateStatusChange, validateTaskUpdate } from '../lib/validation';

export const TaskDetailModal = ({ task, onClose, onUpdate, allTasks = [] }) => {
  const [updating, setUpdating] = useState(false);
  const [dependencies, setDependencies] = useState([]);
  const [blockedBy, setBlockedBy] = useState([]);

  if (!task) return null;

  // Calculate dependencies and blocked tasks
  React.useEffect(() => {
    if (!task || !allTasks.length) return;

    // Get tasks this depends on (predecessors)
    const deps = task.depends_on || [];
    const depTasks = deps.map(id => allTasks.find(t => t.id === id)).filter(Boolean);
    setDependencies(depTasks);

    // Get tasks that depend on this (successors)
    const blocked = allTasks.filter(t => {
      const taskDeps = t.depends_on || [];
      return taskDeps.includes(task.id);
    });
    setBlockedBy(blocked);
  }, [task, allTasks]);

  // ✅ FIXED: Use toast instead of alert + added validation
  const handleStatusChange = async (newStatus) => {
    if (updating) return;

    // ✅ Validate business rules before updating
    if (!validateStatusChange(task, newStatus)) {
      return; // Validation failed, error toast already shown
    }

    setUpdating(true);

    // Show loading toast
    const loadingToast = toast.loading('Updating task status...');

    try {
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'IN_PROGRESS' && !task.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (newStatus === 'DONE' && !task.completed_at) {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      // ✅ Validate updates before sending to DB
      if (!validateTaskUpdate(updates)) {
        toast.dismiss(loadingToast);
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id);

      if (error) throw error;

      // Success!
      toast.success(`✅ Task marked as ${newStatus}`, {
        id: loadingToast,
      });

      // Notify parent to refresh
      if (onUpdate) onUpdate();

      // Update local task object
      Object.assign(task, updates);

    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`❌ Failed to update: ${error.message}`, {
        id: loadingToast,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ FIXED: Removed BLOCKED from status options
  // BLOCKED is execution_status (calculated), not a task status
  const getStatusOptions = () => {
    return [
      { value: 'PENDING', label: '⏸️ Pending', color: 'bg-status-pending-bg' },
      { value: 'IN_PROGRESS', label: '⏳ In Progress', color: 'bg-status-inProgress-bg' },
      { value: 'DONE', label: '✅ Done', color: 'bg-status-done-bg' }
    ];
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* ✅ FIXED: Mobile responsive - w-full on mobile, w-[600px] on md+ screens */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white/70 backdrop-blur-md shadow-2xl z-50 overflow-y-auto animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 bg-white/95 border-b-2 ${task.is_milestone ? 'border-yellow-400' : 'border-blue-400'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              {/* Title Row */}
              <div className="flex items-center gap-3 mb-3">
                {task.is_milestone && <span className="text-4xl">🏆</span>}
                <h2 className="text-3xl font-bold text-gray-900">{task.name}</h2>
              </div>

              {/* Status & Meta Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Current Status */}
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                  task.status === 'DONE' ? 'bg-status-done-badgeBg text-status-done-badgeText' :
                  task.status === 'IN_PROGRESS' ? 'bg-status-inProgress-badgeBg text-status-inProgress-badgeText' :
                  task.status === 'BLOCKED' ? 'bg-status-blocked-badgeBg text-status-blocked-badgeText' :
                  'bg-status-pending-badgeBg text-status-pending-badgeText'
                }`}>
                  {task.status}
                </span>

                {/* Priority */}
                {/* ✅ FIXED: Removed 'CRITICAL' check - schema only has HIGH/MEDIUM/LOW */}
                {task.priority && (
                  <span className={`px-3 py-2 rounded-full text-sm font-bold shadow-md ${
                    task.priority === 'HIGH' ? 'bg-priority-high-bg text-priority-high-text' :
                    task.priority === 'MEDIUM' ? 'bg-priority-medium-bg text-priority-medium-text' :
                    'bg-priority-low-bg text-priority-low-text'
                  }`}>
                    {task.priority}
                  </span>
                )}

                {/* Assignee */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-md">
                  {task.assigned_type === 'HUMAN' ? (
                    <>
                      <User className="w-5 h-5 text-info-600" />
                      <span className="font-bold text-info-900">{task.assigned_to || 'Unassigned'}</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 text-ai-primary" />
                      <span className="font-bold text-ai-text">{task.assigned_to || 'AI Agent'}</span>
                    </>
                  )}
                </div>

                {/* Phase */}
                <span className="px-3 py-2 bg-info-100 text-info-900 rounded-full text-sm font-bold shadow-md">
                  Phase {task.phase_id}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-all"
            >
              <X className="w-7 h-7 text-gray-700" />
            </button>
          </div>

          {/* Quick Status Change Buttons - Only for HUMAN tasks */}
          {task.assigned_type === 'HUMAN' && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm font-semibold text-gray-700 mb-2">⚡ Quick Status Change:</p>
              <div className="flex gap-2 flex-wrap">
                {getStatusOptions().map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={task.status === option.value || updating}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition-all ${
                      task.status === option.value 
                        ? 'opacity-50 cursor-not-allowed' 
                        : updating 
                          ? 'opacity-50' 
                          : 'hover:scale-105 hover:shadow-lg'
                    } ${option.color}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Milestone Description */}
          {task.is_milestone && task.milestone_description && (
            <div className="p-4 bg-milestone-bg border-l-4 border-milestone-border rounded-lg shadow">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                🎯 Milestone Goal
              </h4>
              <p className="text-gray-800 leading-relaxed">{task.milestone_description}</p>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                📝 Description
              </h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            {/* Time Estimates */}
            {task.estimated_hours && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-info-600" />
                <div>
                  <div className="text-xs text-gray-600">Estimated</div>
                  <div className="font-bold text-lg">{task.estimated_hours}h</div>
                </div>
              </div>
            )}

            {task.actual_hours && (
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success-600" />
                <div>
                  <div className="text-xs text-gray-600">Actual</div>
                  <div className="font-bold text-lg text-success-700">{task.actual_hours}h</div>
                </div>
              </div>
            )}

            {/* Dates */}
            {task.started_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-info-600" />
                <div>
                  <div className="text-xs text-gray-600">Started</div>
                  <div className="font-semibold text-sm">{new Date(task.started_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {task.completed_at && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <div>
                  <div className="text-xs text-gray-600">Completed</div>
                  <div className="font-semibold text-sm">{new Date(task.completed_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {/* Subtasks Count */}
            {task.child_count > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-blue-600 font-bold">📁</div>
                <div>
                  <div className="text-xs text-gray-600">Subtasks</div>
                  <div className="font-bold text-lg">{task.child_count}</div>
                </div>
              </div>
            )}
          </div>

          {/* Dependencies - Predecessors */}
          {dependencies.length > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-yellow-600" />
                ⬅️ Depends on ({dependencies.length})
              </h4>
              <div className="space-y-2">
                {dependencies.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-yellow-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{dep.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Status: <span className={`font-bold ${
                          dep.status === 'DONE' ? 'text-green-600' :
                          dep.status === 'IN_PROGRESS' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>{dep.status}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      dep.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      dep.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {dep.status === 'DONE' ? '✅' : dep.status === 'IN_PROGRESS' ? '⏳' : '⏸️'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-700 mt-3">
                💡 These tasks must be completed before you can start this one
              </p>
            </div>
          )}

          {/* Blockers - Successors */}
          {blockedBy.length > 0 && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ➡️ Blocks {blockedBy.length} Task(s)
              </h4>
              <div className="space-y-2">
                {blockedBy.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-blue-200"
                  >
                    <div className="font-semibold text-gray-900">{blocked.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Waiting for this task to complete
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-700 mt-3">
                ⚠️ Other tasks are waiting for this. Prioritize completing this task!
              </p>
            </div>
          )}

          {/* Parent Task */}
          {task.parent_name && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
              <div className="text-sm text-info-text">
                <span className="font-semibold">↳ Part of:</span> {task.parent_name}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                📌 Notes
              </h4>
              <p className="text-gray-700 italic leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {task.notes}
              </p>
            </div>
          )}

          {/* Tech Details */}
          {(task.ram_usage || task.port) && (
            <div className="p-4 bg-ai-light border border-ai-border rounded-lg">
              <h4 className="font-bold text-lg mb-2">🔧 Technical Details</h4>
              <div className="space-y-1 text-sm">
                {task.ram_usage && (
                  <div><span className="font-semibold">💾 RAM:</span> {task.ram_usage}</div>
                )}
                {task.port && (
                  <div><span className="font-semibold">🔌 Port:</span> {task.port}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Last updated:</span>{' '}
            {task.updated_at ? new Date(task.updated_at).toLocaleString() : 'N/A'}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primaryHover transition-all shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
