import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, Zap, CheckCircle, Clock } from 'lucide-react';

export const AIAnalysisPanel = ({ tasks, onRecommendationApply }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeProject();
  }, [tasks]);

  const analyzeProject = () => {
    setLoading(true);
    
    // AI Critical Path Analysis
    const criticalPath = calculateCriticalPath(tasks);
    const risks = identifyRisks(tasks);
    const recommendations = generateRecommendations(tasks, criticalPath, risks);
    const velocity = calculateVelocity(tasks);
    
    setAnalysis({
      criticalPath,
      risks,
      recommendations,
      velocity,
      estimatedCompletion: estimateCompletion(tasks, velocity)
    });
    
    setLoading(false);
  };

  const calculateCriticalPath = (tasks) => {
    // Find longest path through dependencies
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const memo = new Map();

    const getLongestPath = (taskId) => {
      if (memo.has(taskId)) return memo.get(taskId);
      
      const task = taskMap.get(taskId);
      if (!task) return { path: [], duration: 0 };
      
      const duration = task.estimated_hours || 1;
      // Find tasks that depend on this one (successors)
      const downstreamTasks = tasks.filter(t => {
        const deps = t.depends_on || [];
        return deps.includes(taskId);
      });
      
      if (downstreamTasks.length === 0) {
        const result = { path: [taskId], duration };
        memo.set(taskId, result);
        return result;
      }
      
      let longestSubPath = { path: [], duration: 0 };
      downstreamTasks.forEach(dt => {
        const subPath = getLongestPath(dt.id);
        if (subPath.duration > longestSubPath.duration) {
          longestSubPath = subPath;
        }
      });
      
      const result = {
        path: [taskId, ...longestSubPath.path],
        duration: duration + longestSubPath.duration
      };
      memo.set(taskId, result);
      return result;
    };

    // Find critical path from root tasks (tasks with no dependencies)
    let criticalPath = { path: [], duration: -1 };
    const rootTasks = tasks.filter(t => 
      !t.depends_on || t.depends_on.length === 0
    );
    
    rootTasks.forEach(task => {
      const pathInfo = getLongestPath(task.id);
      if (pathInfo.duration > criticalPath.duration) {
        criticalPath = pathInfo;
      }
    });

    return criticalPath;
  };

  const identifyRisks = (tasks) => {
    const risks = [];
    
    // Risk 1: Blocked tasks with no progress
    const blockedTasks = tasks.filter(t => t.execution_status === 'BLOCKED');
    if (blockedTasks.length > 0) {
      risks.push({
        type: 'BLOCKED_TASKS',
        severity: 'HIGH',
        count: blockedTasks.length,
        message: `${blockedTasks.length} tasks blocked by dependencies`,
        tasks: blockedTasks.slice(0, 5).map(t => ({ id: t.id, name: t.name }))
      });
    }
    
    // Risk 2: High complexity tasks not started
    const highComplexityPending = tasks.filter(t => 
      t.complexity >= 4 && t.status === 'PENDING'
    );
    if (highComplexityPending.length > 0) {
      risks.push({
        type: 'HIGH_COMPLEXITY',
        severity: 'MEDIUM',
        count: highComplexityPending.length,
        message: `${highComplexityPending.length} high-complexity tasks not started`,
        tasks: highComplexityPending.slice(0, 5).map(t => ({ id: t.id, name: t.name, complexity: t.complexity }))
      });
    }
    
    // Risk 3: Tasks in progress too long
    const stuckTasks = tasks.filter(t => {
      if (t.status !== 'IN_PROGRESS' || !t.started_at) return false;
      const daysSinceStart = (new Date() - new Date(t.started_at)) / (1000 * 60 * 60 * 24);
      return daysSinceStart > 7; // More than 7 days
    });
    if (stuckTasks.length > 0) {
      risks.push({
        type: 'STUCK_TASKS',
        severity: 'MEDIUM',
        count: stuckTasks.length,
        message: `${stuckTasks.length} tasks in progress > 7 days`,
        tasks: stuckTasks.map(t => ({ id: t.id, name: t.name, days: Math.floor((new Date() - new Date(t.started_at)) / (1000 * 60 * 60 * 24)) }))
      });
    }
    
    return risks;
  };

  const calculateVelocity = (tasks) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyCompleted = tasks.filter(t =>
      t.status === 'DONE' &&
      t.completed_at &&
      new Date(t.completed_at) >= sevenDaysAgo
    );
    
    const tasksPerDay = recentlyCompleted.length / 7;
    const hoursPerDay = recentlyCompleted.reduce((sum, t) => 
      sum + (parseFloat(t.actual_hours) || parseFloat(t.estimated_hours) || 0), 0
    ) / 7;
    
    return {
      tasksPerDay: tasksPerDay.toFixed(2),
      hoursPerDay: hoursPerDay.toFixed(1),
      trend: tasksPerDay > 0.5 ? 'UP' : 'STABLE'
    };
  };

  const estimateCompletion = (tasks, velocity) => {
    const remaining = tasks.filter(t => t.status !== 'DONE').length;
    const tasksPerDay = parseFloat(velocity.tasksPerDay) || 0.5;
    const daysRemaining = Math.ceil(remaining / tasksPerDay);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    
    return {
      daysRemaining,
      completionDate: completionDate.toLocaleDateString(),
      confidence: tasksPerDay > 0.5 ? 'HIGH' : 'LOW'
    };
  };

  const generateRecommendations = (tasks, criticalPath, risks) => {
    const recommendations = [];
    
    // Recommendation 1: Focus on critical path
    if (criticalPath.path.length > 0) {
      const criticalTasks = criticalPath.path.map(id => 
        tasks.find(t => t.id === id)
      ).filter(Boolean);
      
      const pendingCritical = criticalTasks.filter(t => t.status === 'PENDING');
      if (pendingCritical.length > 0) {
        recommendations.push({
          type: 'CRITICAL_PATH',
          priority: 'HIGH',
          action: 'START_TASKS',
          message: `Start ${pendingCritical.length} tasks on critical path`,
          tasks: pendingCritical.slice(0, 3),
          impact: `Reduces project duration by ${(criticalPath.duration / 8).toFixed(0)} days`
        });
      }
    }
    
    // Recommendation 2: Unblock dependencies
    const blockedRisk = risks.find(r => r.type === 'BLOCKED_TASKS');
    if (blockedRisk) {
      // Find tasks that are blocking others (tasks that have successors waiting)
      const blockingTasks = new Set();
      tasks.forEach(t => {
        if (t.execution_status === 'BLOCKED' && t.depends_on) {
          t.depends_on.forEach(depId => blockingTasks.add(depId));
        }
      });
      
      const blockingTasksList = Array.from(blockingTasks).map(id => 
        tasks.find(t => t.id === id)
      ).filter(t => t && t.status !== 'DONE');
      
      if (blockingTasksList.length > 0) {
        recommendations.push({
          type: 'UNBLOCK',
          priority: 'HIGH',
          action: 'COMPLETE_DEPENDENCIES',
          message: `Complete ${blockingTasksList.length} tasks to unblock ${blockedRisk.count} others`,
          tasks: blockingTasksList.slice(0, 3),
          impact: `Unblocks ${blockedRisk.count} tasks`
        });
      }
    }
    
    // Recommendation 3: Balance workload
    const humanTasks = tasks.filter(t => t.assigned_type === 'HUMAN' && t.status === 'PENDING');
    const aiTasks = tasks.filter(t => t.assigned_type === 'AI' && t.status === 'PENDING');
    
    if (humanTasks.length > aiTasks.length * 2) {
      recommendations.push({
        type: 'WORKLOAD_BALANCE',
        priority: 'MEDIUM',
        action: 'REASSIGN_TASKS',
        message: `Consider reassigning ${Math.floor((humanTasks.length - aiTasks.length) / 2)} tasks to AI`,
        impact: `Better resource utilization`
      });
    }
    
    return recommendations;
  };

  const handleApplyRecommendation = (recommendation) => {
    if (onRecommendationApply) {
      onRecommendationApply(recommendation);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-secondary rounded-xl border border-border-default p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-brand-primary animate-pulse" />
          <h3 className="text-lg font-bold text-text-primary">AI Analysis</h3>
        </div>
        <p className="text-text-secondary">Analyzing project...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-background-secondary rounded-xl border border-border-default p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-brand-primary" />
        <h3 className="text-lg font-bold text-text-primary">AI Project Analysis</h3>
      </div>

      {/* Critical Path */}
      <div className="mb-6">
        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning-default" />
          Critical Path
        </h4>
        <div className="bg-warning-background border border-warning-default rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Longest path duration:</span>
            <span className="text-lg font-bold text-warning-text">
              {(analysis.criticalPath.duration / 8).toFixed(0)} days
            </span>
          </div>
          <div className="text-xs text-text-tertiary">
            {analysis.criticalPath.path.length} tasks on critical path
          </div>
        </div>
      </div>

      {/* Velocity */}
      <div className="mb-6">
        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success-default" />
          Team Velocity
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-info-background rounded-lg p-3">
            <div className="text-2xl font-bold text-info-text">{analysis.velocity.tasksPerDay}</div>
            <div className="text-xs text-text-secondary">tasks/day</div>
          </div>
          <div className="bg-info-background rounded-lg p-3">
            <div className="text-2xl font-bold text-info-text">{analysis.velocity.hoursPerDay}h</div>
            <div className="text-xs text-text-secondary">hours/day</div>
          </div>
        </div>
      </div>

      {/* Estimated Completion */}
      <div className="mb-6">
        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          Estimated Completion
        </h4>
        <div className="bg-brand-background border border-brand-default rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Target date:</span>
            <span className="text-lg font-bold text-brand-text">
              {analysis.estimatedCompletion.completionDate}
            </span>
          </div>
          <div className="text-xs text-text-tertiary">
            ~{analysis.estimatedCompletion.daysRemaining} days remaining 
            ({analysis.estimatedCompletion.confidence} confidence)
          </div>
        </div>
      </div>

      {/* Risks */}
      {analysis.risks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-error-default" />
            Risks Identified ({analysis.risks.length})
          </h4>
          <div className="space-y-2">
            {analysis.risks.map((risk, idx) => (
              <div 
                key={idx}
                className={`rounded-lg p-3 border ${
                  risk.severity === 'HIGH' ? 'bg-error-background border-error-default' :
                  'bg-warning-background border-warning-default'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-semibold ${
                    risk.severity === 'HIGH' ? 'text-error-text' : 'text-warning-text'
                  }`}>
                    {risk.message}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    risk.severity === 'HIGH' ? 'bg-error-default text-white' :
                    'bg-warning-default text-white'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                {risk.tasks && risk.tasks.length > 0 && (
                  <div className="text-xs text-text-tertiary mt-2">
                    Affected: {risk.tasks.map(t => `#${t.id}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-default" />
            AI Recommendations ({analysis.recommendations.length})
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="bg-success-background border border-success-default rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        rec.priority === 'HIGH' ? 'bg-error-default text-white' :
                        'bg-warning-default text-white'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-bold text-success-text">{rec.message}</span>
                    </div>
                    <div className="text-xs text-text-secondary mb-2">
                      💡 Impact: {rec.impact}
                    </div>
                    {rec.tasks && rec.tasks.length > 0 && (
                      <div className="text-xs text-text-tertiary">
                        Tasks: {rec.tasks.map(t => `#${t.id} ${t.name}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleApplyRecommendation(rec)}
                    className="ml-3 px-3 py-1 bg-success-default text-white rounded-lg text-xs font-semibold hover:bg-success-default/80 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
