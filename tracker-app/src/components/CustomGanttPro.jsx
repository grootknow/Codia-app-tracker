import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, isToday, startOfDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { TaskDetailModal } from './TaskDetailModal';

/**
 * CustomGanttPro - Professional Gantt Chart Component
 * 
 * Features:
 * - View modes: Day/Week/Month
 * - Today marker (vertical red line)
 * - Milestone diamonds (for is_milestone tasks)
 * - 2-tier timeline header (Month + Week/Day)
 * - Proper sorting (Priority/Start/End/Duration)
 * - Progress bars inside tasks
 * - Dependency arrows (optional)
 */
export const CustomGanttPro = () => {
  // ==================== STATE ====================
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'start' | 'end' | 'duration'
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showBaseline, setShowBaseline] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState(new Set());
  const [draggedTask, setDraggedTask] = useState(null);
  const [resizingTask, setResizingTask] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, task: null, x: 0, y: 0 });
  
  const timelineRef = useRef(null);
  const leftPanelRef = useRef(null);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [tasksRes, phasesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('order_index'),
        supabase.from('phases').select('*').order('order_index')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (phasesRes.error) throw phasesRes.error;

      setTasks(tasksRes.data || []);
      setPhases(phasesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load Gantt data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  
  // Build task hierarchy (parent-child relationships)
  const buildTaskHierarchy = (tasks) => {
    const taskMap = new Map(tasks.map(t => [t.id, { ...t, children: [] }]));
    const roots = [];
    
    tasks.forEach(task => {
      const node = taskMap.get(task.id);
      if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
        taskMap.get(task.parent_task_id).children.push(node);
      } else {
        roots.push(node);
      }
    });
    
    return { taskMap, roots };
  };
  
  // Flatten hierarchy for rendering with indentation
  const flattenHierarchy = (nodes, level = 0, result = []) => {
    nodes.forEach(node => {
      result.push({ ...node, level });
      if (!collapsedTasks.has(node.id) && node.children?.length > 0) {
        flattenHierarchy(node.children, level + 1, result);
      }
    });
    return result;
  };
  
  // Toggle phase collapse
  const togglePhase = (phaseId) => {
    const newCollapsed = new Set(collapsedPhases);
    if (newCollapsed.has(phaseId)) {
      newCollapsed.delete(phaseId);
    } else {
      newCollapsed.add(phaseId);
    }
    setCollapsedPhases(newCollapsed);
  };
  
  // Toggle task collapse (for parent tasks)
  const toggleTask = (taskId) => {
    const newCollapsed = new Set(collapsedTasks);
    if (newCollapsed.has(taskId)) {
      newCollapsed.delete(taskId);
    } else {
      newCollapsed.add(taskId);
    }
    setCollapsedTasks(newCollapsed);
  };
  
  // ==================== CALCULATIONS ====================
  
  // Calculate project date range
  const projectDates = useMemo(() => {
    if (!tasks.length) {
      const today = new Date();
      return {
        start: startOfMonth(today),
        end: endOfMonth(addDays(today, 90))
      };
    }

    const dates = tasks.map(task => {
      const start = task.start_date ? new Date(task.start_date) : 
                    task.started_at ? new Date(task.started_at) : new Date();
      const duration = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 3;
      const end = task.due_date ? new Date(task.due_date) :
                  task.completed_at ? new Date(task.completed_at) : addDays(start, duration);
      return { start, end };
    });

    const allStarts = dates.map(d => d.start);
    const allEnds = dates.map(d => d.end);
    
    const minDate = new Date(Math.min(...allStarts));
    const maxDate = new Date(Math.max(...allEnds));

    return {
      start: startOfMonth(minDate),
      end: endOfMonth(addDays(maxDate, 30))
    };
  }, [tasks]);

  // Calculate day width based on view mode
  const dayWidth = useMemo(() => {
    switch (viewMode) {
      case 'day': return 60; // 60px per day
      case 'week': return 20; // 20px per day (140px per week)
      case 'month': return 4; // 4px per day (~120px per month)
      default: return 20;
    }
  }, [viewMode]);

  // Sort and flatten tasks with hierarchy
  const sortedTasks = useMemo(() => {
    // First, sort root-level tasks
    const sorted = [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        }
        case 'start': {
          const dateA = a.start_date || a.started_at || '9999-12-31';
          const dateB = b.start_date || b.started_at || '9999-12-31';
          return dateA.localeCompare(dateB);
        }
        case 'end': {
          const dateA = a.due_date || a.completed_at || '9999-12-31';
          const dateB = b.due_date || b.completed_at || '9999-12-31';
          return dateA.localeCompare(dateB);
        }
        case 'duration': {
          const durationA = a.estimated_hours || 0;
          const durationB = b.estimated_hours || 0;
          return durationB - durationA;
        }
        default:
          return 0;
      }
    });
    
    // Build hierarchy
    const { roots } = buildTaskHierarchy(sorted);
    
    // Flatten with indentation
    return flattenHierarchy(roots);
  }, [tasks, sortBy, collapsedTasks]);

  // Get task position
  const getTaskPosition = (task) => {
    const startDate = task.start_date ? new Date(task.start_date) : 
                     task.started_at ? new Date(task.started_at) : new Date();
    const duration = task.estimated_hours ? Math.max(1, Math.ceil(task.estimated_hours / 8)) : 3;
    const endDate = task.due_date ? new Date(task.due_date) :
                   task.completed_at ? new Date(task.completed_at) : addDays(startDate, duration);
    
    const left = differenceInDays(startDate, projectDates.start) * dayWidth;
    const width = Math.max(differenceInDays(endDate, startDate) * dayWidth, dayWidth);
    
    return { left, width, startDate, endDate };
  };

  // Calculate today position
  const todayPosition = useMemo(() => {
    const today = startOfDay(new Date());
    const daysFromStart = differenceInDays(today, projectDates.start);
    return daysFromStart * dayWidth;
  }, [projectDates.start, dayWidth]);

  // ==================== EVENT HANDLERS ====================
  
  const handleTaskClick = (task) => {
    const taskElement = leftPanelRef.current?.querySelector(`[data-task-id="${task.id}"]`);
    const timelineEl = timelineRef.current;
    const leftPanelEl = leftPanelRef.current;
    
    if (timelineEl && leftPanelEl && taskElement) {
      const { left, width } = getTaskPosition(task);
      const timelineWidth = timelineEl.offsetWidth;
      
      // Horizontal scroll
      const barCenter = left + (width / 2);
      const viewportCenter = timelineWidth / 2;
      const targetScrollLeft = Math.max(0, barCenter - viewportCenter);
      
      // Vertical scroll
      const taskRect = taskElement.getBoundingClientRect();
      const panelRect = leftPanelEl.getBoundingClientRect();
      const currentScrollTop = leftPanelEl.scrollTop;
      const targetScrollTop = Math.max(0, 
        currentScrollTop + (taskRect.top - panelRect.top) - (panelRect.height / 2) + (taskRect.height / 2)
      );
      
      timelineEl.scrollTo({ left: targetScrollLeft, top: targetScrollTop, behavior: 'smooth' });
      leftPanelEl.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

  const handleBarClick = (task) => {
    setSelectedTask(task);
  };

  const scrollToToday = () => {
    const timelineEl = timelineRef.current;
    if (timelineEl) {
      const timelineWidth = timelineEl.offsetWidth;
      const targetScrollLeft = Math.max(0, todayPosition - (timelineWidth / 2));
      timelineEl.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  };

  // ==================== TIMELINE HEADERS ====================
  
  const renderTimelineHeaders = () => {
    const totalDays = differenceInDays(projectDates.end, projectDates.start);
    const ganttWidth = totalDays * dayWidth;

    if (viewMode === 'month') {
      // Month view: Show months only
      const months = eachMonthOfInterval({ start: projectDates.start, end: projectDates.end });
      
      return (
        <div style={{ width: ganttWidth, position: 'relative', height: 60 }}>
          {/* Month header */}
          <div className="flex border-b border-border-default bg-background-secondary">
            {months.map((month, idx) => {
              const monthStart = month;
              const monthEnd = endOfMonth(month);
              const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
              const width = daysInMonth * dayWidth;
              
              return (
                <div 
                  key={idx}
                  style={{ width: `${width}px`, minWidth: `${width}px` }}
                  className="border-r border-border-default p-2 text-center font-semibold text-sm"
                >
                  {format(month, 'MMM yyyy')}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (viewMode === 'week') {
      // Week view: Month + Week
      const months = eachMonthOfInterval({ start: projectDates.start, end: projectDates.end });
      const weeks = eachWeekOfInterval({ start: projectDates.start, end: projectDates.end }, { weekStartsOn: 1 });
      
      return (
        <div style={{ width: ganttWidth, position: 'relative', height: 60 }}>
          {/* Month header */}
          <div className="flex border-b border-border-default bg-background-secondary h-8">
            {months.map((month, idx) => {
              const monthStart = month;
              const monthEnd = endOfMonth(month);
              const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
              const width = daysInMonth * dayWidth;
              
              return (
                <div 
                  key={idx}
                  style={{ width: `${width}px`, minWidth: `${width}px` }}
                  className="border-r border-border-default px-2 text-center font-semibold text-xs flex items-center justify-center"
                >
                  {format(month, 'MMM yyyy')}
                </div>
              );
            })}
          </div>
          
          {/* Week header */}
          <div className="flex border-b border-border-default bg-background-tertiary h-8">
            {weeks.map((week, idx) => {
              const weekStart = week;
              const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
              const daysInWeek = differenceInDays(weekEnd, weekStart) + 1;
              const width = daysInWeek * dayWidth;
              
              return (
                <div 
                  key={idx}
                  style={{ width: `${width}px`, minWidth: `${width}px` }}
                  className="border-r border-border-default px-1 text-center text-xs flex items-center justify-center"
                >
                  W{format(week, 'w')}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Day view: Month + Day
    const months = eachMonthOfInterval({ start: projectDates.start, end: projectDates.end });
    const days = eachDayOfInterval({ start: projectDates.start, end: projectDates.end });
    
    return (
      <div style={{ width: ganttWidth, position: 'relative', height: 60 }}>
        {/* Month header */}
        <div className="flex border-b border-border-default bg-background-secondary h-8">
          {months.map((month, idx) => {
            const monthStart = month;
            const monthEnd = endOfMonth(month);
            const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
            const width = daysInMonth * dayWidth;
            
            return (
              <div 
                key={idx}
                style={{ width: `${width}px`, minWidth: `${width}px` }}
                className="border-r border-border-default px-2 text-center font-semibold text-xs flex items-center justify-center"
              >
                {format(month, 'MMM yyyy')}
              </div>
            );
          })}
        </div>
        
        {/* Day header */}
        <div className="flex border-b border-border-default bg-background-tertiary h-8">
          {days.map((day, idx) => (
            <div 
              key={idx}
              style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
              className={`border-r border-border-default text-center text-xs flex items-center justify-center ${
                isToday(day) ? 'bg-red-100 font-bold text-red-600' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-tertiary">Loading Gantt Pro...</p>
      </div>
    );
  }

  const totalDays = differenceInDays(projectDates.end, projectDates.start);
  const ganttWidth = totalDays * dayWidth;

  return (
    <div className="h-full flex flex-col bg-background-secondary rounded-lg border border-border-default">
      <Toaster position="top-right" />
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={loadData} 
        />
      )}
      
      {/* Header Controls */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-border-default">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-lg text-text-primary">Gantt Pro</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center gap-1 border border-border-default rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Month
            </button>
          </div>
          
          <div className="border-l border-border-default h-6 mx-2"></div>
          
          {/* Sort */}
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)} 
            className="bg-background-primary border border-border-default rounded-md px-2 py-1 text-sm"
          >
            <option value="priority">Priority</option>
            <option value="start">Start Date</option>
            <option value="end">End Date</option>
            <option value="duration">Duration</option>
          </select>
          
          <div className="border-l border-border-default h-6 mx-2"></div>
          
          {/* Today Button */}
          <button 
            onClick={scrollToToday}
            className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-1"
            title="Jump to Today"
          >
            <Calendar className="w-4 h-4" />
            Today
          </button>
          
          <div className="border-l border-border-default h-6 mx-2"></div>
          
          {/* Critical Path */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              checked={showCriticalPath} 
              onChange={() => setShowCriticalPath(!showCriticalPath)} 
            />
            Critical Path
          </label>
        </div>
      </div>
      
      {/* Gantt Chart */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Tasks */}
        <div 
          ref={leftPanelRef}
          className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-border-default"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Header */}
          <div className="h-[60px] flex items-center px-4 sticky top-0 z-20 bg-background-secondary border-b border-border-default">
            <h4 className="font-bold text-text-primary">Tasks</h4>
          </div>
          
          {/* Task List */}
          <div className="relative">
            {phases.map(phase => (
              <React.Fragment key={phase.id}>
                <div className="h-10 flex items-center p-2 sticky top-[60px] z-10 bg-background-tertiary border-b border-t border-border-default">
                  <strong className="text-sm text-text-primary">{phase.name}</strong>
                </div>
                {sortedTasks.filter(t => t.phase_id === phase.id).map(task => (
                  <div 
                    key={task.id}
                    data-task-id={task.id}
                    className="h-10 flex items-center justify-between p-2 text-sm border-b border-border-default cursor-pointer hover:bg-background-tertiary"
                    onClick={() => handleTaskClick(task)}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    <span className="truncate pr-2 flex items-center gap-2">
                      {task.is_milestone && <span className="text-yellow-500">◆</span>}
                      {task.name}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      task.status === 'DONE' ? 'bg-success-background text-success-text' : 
                      task.status === 'IN_PROGRESS' ? 'bg-info-background text-info-text' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Right Panel - Timeline */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div style={{ width: ganttWidth, position: 'relative' }}>
            {/* Timeline Headers */}
            {renderTimelineHeaders()}
            
            {/* Gantt Bars */}
            <div className="relative" style={{ width: ganttWidth }}>
              {/* Today Marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                style={{ left: `${todayPosition}px` }}
              >
                <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  Today
                </div>
              </div>
              
              {/* Task Bars */}
              {phases.map(phase => (
                <React.Fragment key={`phase-bars-${phase.id}`}>
                  <div className="h-10 bg-background-tertiary/30 border-b border-t border-border-default"></div>
                  {sortedTasks.filter(t => t.phase_id === phase.id).map(task => {
                    const { left, width } = getTaskPosition(task);
                    const progress = task.progress_percentage || 0;
                    
                    return (
                      <div key={`bar-${task.id}`} className="h-10 relative border-b border-border-default">
                        {task.is_milestone ? (
                          // Milestone Diamond
                          <div
                            style={{ left: `${left}px`, top: '12px' }}
                            className="absolute w-6 h-6 bg-yellow-400 border-2 border-yellow-600 transform rotate-45 cursor-pointer hover:scale-110 transition-transform z-10"
                            onClick={() => handleBarClick(task)}
                            title={task.name}
                          ></div>
                        ) : (
                          // Regular Task Bar
                          <div
                            style={{ left: `${left}px`, width: `${width}px`, top: '5px', height: '30px' }}
                            className={`absolute rounded-md cursor-pointer transition-all duration-200 ${
                              task.status === 'DONE' ? 'bg-green-500' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                              'bg-gray-400'
                            } hover:opacity-80 shadow-md`}
                            onClick={() => handleBarClick(task)}
                          >
                            {/* Progress Bar */}
                            {progress > 0 && (
                              <div 
                                className="absolute top-0 left-0 bottom-0 bg-black/20 rounded-l-md"
                                style={{ width: `${progress}%` }}
                              ></div>
                            )}
                            
                            {/* Task Name */}
                            <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-semibold truncate">
                              {task.name}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
