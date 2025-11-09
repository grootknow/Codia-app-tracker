import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { supabase } from '../lib/supabase';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Calendar, RefreshCw, Undo2, Redo2, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { TaskDetailModal } from './TaskDetailModal';
import { useDebounce } from '../hooks/useDebounce';

export const CustomGanttComplete = ({ selectedTask: highlightedTaskFromPage }) => {
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [immediateHoveredTask, setImmediateHoveredTask] = useState(null);
  const hoveredTask = useDebounce(immediateHoveredTask, 50);
  const [sortBy, setSortBy] = useState('order');
  const [showAllArrows, setShowAllArrows] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(true); // Auto-enable Critical Path
  const [localHighlightedTask, setLocalHighlightedTask] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [draggedTask, setDraggedTask] = useState(null);
  const [resizingTask, setResizingTask] = useState(null);
  const [linkingState, setLinkingState] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const highlightedTask = highlightedTaskFromPage ? highlightedTaskFromPage.task_id : localHighlightedTask;

  // --- Highlighting Logic ---
  const highlightedIds = useMemo(() => {
    if (!hoveredTask || !tasks.length) return new Set();
    
    const related = new Set([hoveredTask]);
    const MAX_DEPTH = 50;
    
    const checkDownstream = (id, depth = 0) => {
      if (depth > MAX_DEPTH) return;
      tasks.forEach(t => {
        if (t.blocking_dependencies) {
          const depIds = t.blocking_dependencies.map(d => 
            typeof d === 'string' ? parseInt(d.split(':')[0]) : d
          );
          if (depIds.includes(id) && !related.has(t.id)) {
            related.add(t.id);
            checkDownstream(t.id, depth + 1);
          }
        }
      });
    };
    
    const checkUpstream = (id, depth = 0) => {
      if (depth > MAX_DEPTH) return;
      const task = tasks.find(t => t.id === id);
      if (task?.blocking_dependencies) {
        task.blocking_dependencies.forEach(depString => {
          const depId = typeof depString === 'string' ? parseInt(depString.split(':')[0]) : depString;
          if (!related.has(depId)) {
            related.add(depId);
            checkUpstream(depId, depth + 1);
          }
        });
      }
    };
    
    checkDownstream(hoveredTask);
    checkUpstream(hoveredTask);
    return related;
  }, [hoveredTask, tasks]);

  // --- Critical Path Logic ---
  const criticalPathIds = useMemo(() => {
    if (!tasks || !tasks.length) return new Set();

    try {
      const taskMap = new Map(tasks.map(t => [t.id, t]));
      const memo = new Map();
      const MAX_DEPTH = 100; // Prevent infinite recursion

      const getLongestPath = (taskId, depth = 0) => {
        if (depth > MAX_DEPTH) return { path: [], duration: 0 };
        if (memo.has(taskId)) return memo.get(taskId);

        const task = taskMap.get(taskId);
        if (!task) return { path: [], duration: 0 };

        const duration = task.estimated_hours ? Math.max(1, Math.ceil(task.estimated_hours / 8)) : 1;

        const downstreamTasks = tasks.filter(t => {
          if (!t.blocking_dependencies) return false;
          const depIds = t.blocking_dependencies.map(d => 
            typeof d === 'string' ? parseInt(d.split(':')[0]) : d
          );
          return depIds.includes(taskId);
        });

        if (downstreamTasks.length === 0) {
          const result = { path: [taskId], duration };
          memo.set(taskId, result);
          return result;
        }

        let longestSubPath = { path: [], duration: 0 };
        downstreamTasks.forEach(downstreamTask => {
          const subPath = getLongestPath(downstreamTask.id, depth + 1);
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

      let criticalPath = { path: [], duration: -1 };
      const rootTasks = tasks.filter(t => !t.blocking_dependencies || t.blocking_dependencies.length === 0);
      
      rootTasks.forEach(task => {
        const pathInfo = getLongestPath(task.id);
        if (pathInfo.duration > criticalPath.duration) {
          criticalPath = pathInfo;
        }
      });

      return new Set(criticalPath.path);
    } catch (error) {
      console.error('Error calculating critical path:', error);
      return new Set();
    }
  }, [tasks]);

  const leftPanelRef = useRef(null);
  const timelineRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const handleScroll = (e) => {
    // Throttle scroll updates to reduce re-renders
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollTop(e.currentTarget.scrollTop);
      setScrollLeft(e.currentTarget.scrollLeft);
    }, 16); // ~60fps
  };

  useEffect(() => {
    // Sync scroll without triggering re-renders
    const leftPanel = leftPanelRef.current;
    const timeline = timelineRef.current;
    
    if (leftPanel && Math.abs(leftPanel.scrollTop - scrollTop) > 1) {
      leftPanel.scrollTop = scrollTop;
    }
    if (timeline && Math.abs(timeline.scrollTop - scrollTop) > 1) {
      timeline.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  // Handle resize mouse events
  useEffect(() => {
    if (!resizingTask) return;

    const dayWidth = 30 * zoomLevel; // Calculate inside useEffect

    const handleMouseMove = async (e) => {
      const task = tasks.find(t => t.id === resizingTask.id);
      if (!task) return;

      const deltaX = e.clientX - resizingTask.startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (resizingTask.side === 'left') {
        // Resize from left (change start_date)
        const currentStart = task.start_date ? new Date(task.start_date) : new Date(task.started_at);
        const newStartDate = addDays(currentStart, deltaDays);
        
        // Don't allow start after end
        const endDate = task.due_date ? new Date(task.due_date) : addDays(currentStart, 3);
        if (newStartDate >= endDate) return;

        setResizingTask(prev => ({ ...prev, previewDelta: deltaDays }));
      } else {
        // Resize from right (change due_date)
        const currentEnd = task.due_date ? new Date(task.due_date) : addDays(new Date(task.start_date || task.started_at), 3);
        const newEndDate = addDays(currentEnd, deltaDays);
        
        // Don't allow end before start
        const startDate = task.start_date ? new Date(task.start_date) : new Date(task.started_at);
        if (newEndDate <= startDate) return;

        setResizingTask(prev => ({ ...prev, previewDelta: deltaDays }));
      }
    };

    const handleMouseUp = async () => {
      if (!resizingTask.previewDelta) {
        setResizingTask(null);
        return;
      }

      const task = tasks.find(t => t.id === resizingTask.id);
      if (!task) {
        setResizingTask(null);
        return;
      }

      const deltaDays = resizingTask.previewDelta;

      try {
        if (resizingTask.side === 'left') {
          const currentStart = task.start_date ? new Date(task.start_date) : new Date(task.started_at);
          const newStartDate = addDays(currentStart, deltaDays);
          
          const { error } = await supabase
            .from('tasks')
            .update({ start_date: newStartDate.toISOString() })
            .eq('id', task.id);

          if (error) {
            toast.error(`Failed to resize: ${error.message}`);
          } else {
            toast.success(`Start date updated to ${format(newStartDate, 'MMM d')}`);
            loadData();
          }
        } else {
          const currentEnd = task.due_date ? new Date(task.due_date) : addDays(new Date(task.start_date || task.started_at), 3);
          const newEndDate = addDays(currentEnd, deltaDays);
          
          const { error } = await supabase
            .from('tasks')
            .update({ due_date: newEndDate.toISOString() })
            .eq('id', task.id);

          if (error) {
            toast.error(`Failed to resize: ${error.message}`);
          } else {
            toast.success(`Due date updated to ${format(newEndDate, 'MMM d')}`);
            loadData();
          }
        }
      } catch (error) {
        console.error('Resize error:', error);
        toast.error('Failed to resize task');
      }

      setResizingTask(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingTask, tasks, zoomLevel]);

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel('custom_gantt_complete')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, phasesRes, sprintsRes] = await Promise.all([
        supabase.from('tasks_with_dependencies').select('*').order('phase_id').order('order_index'),
        supabase.from('phases').select('*').order('order_index'),
        supabase.from('sprints').select('*').order('start_date')
      ]);
      if (tasksRes.error) {
        console.error('Tasks error:', tasksRes.error);
        toast.error(`Failed to load tasks: ${tasksRes.error.message}`);
        throw tasksRes.error;
      }
      if (phasesRes.error) {
        console.error('Phases error:', phasesRes.error);
        toast.error(`Failed to load phases: ${phasesRes.error.message}`);
        throw phasesRes.error;
      }
      if (sprintsRes.error) {
        console.error('Sprints error:', sprintsRes.error);
        toast.error(`Failed to load sprints: ${sprintsRes.error.message}`);
        throw sprintsRes.error;
      }
      setTasks(tasksRes.data || []);
      setPhases(phasesRes.data || []);
      setSprints(sprintsRes.data || []);
    } catch (error) {
      console.error('LoadData error:', error);
      toast.error('Failed to load Gantt data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ PERFORMANCE FIX: Memoize expensive calculations
  const projectDates = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      const now = new Date();
      return {
        start: now,
        end: addDays(now, 30)
      };
    }

    try {
      const tasksWithDates = tasks.filter(t => t && (t.start_date || t.started_at));
      const start = tasksWithDates.length > 0 
        ? new Date(Math.min(...tasksWithDates.map(t => new Date(t.start_date || t.started_at).getTime())))
        : new Date();

      const tasksWithEndDates = tasks.filter(t => t && (t.due_date || t.completed_at || t.start_date));
      const end = tasksWithEndDates.length > 0
        ? new Date(Math.max(...tasksWithEndDates.map(t => {
            if (t.due_date) return new Date(t.due_date).getTime();
            if (t.completed_at) return new Date(t.completed_at).getTime();
            if (t.start_date) {
              const taskStart = new Date(t.start_date);
              const days = t.estimated_hours ? Math.max(1, Math.ceil(t.estimated_hours / 8)) : 3;
              return addDays(taskStart, days).getTime();
            }
            return new Date().getTime();
          })))
        : addDays(new Date(), 30);

      return { start, end };
    } catch (error) {
      console.error('Error calculating project dates:', error);
      const now = new Date();
      return { start: now, end: addDays(now, 30) };
    }
  }, [tasks]);

  // ✅ PERFORMANCE FIX: Memoize sorted tasks - MUST be before any conditional returns
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'start') return new Date(a.started_at) - new Date(b.started_at);
      return a.order_index - b.order_index;
    });
  }, [tasks, sortBy]);

  const projectStart = projectDates.start;
  const projectEnd = projectDates.end;
  const dayWidth = 30 * zoomLevel;

  // Define getTaskPosition before it's used
  const getTaskPosition = (task) => {
    const startDate = task.start_date ? new Date(task.start_date) : (task.started_at ? new Date(task.started_at) : addDays(new Date(), (task.order_index || 0) * 2));
    const durationDays = task.estimated_hours ? Math.max(1, Math.ceil(task.estimated_hours / 8)) : 3;
    const endDate = task.due_date ? new Date(task.due_date) : (task.completed_at ? new Date(task.completed_at) : addDays(startDate, durationDays));
    const left = differenceInDays(startDate, projectStart) * dayWidth;
    const width = Math.max(differenceInDays(endDate, startDate) * dayWidth, dayWidth);
    return { left, width, startDate, endDate };
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    const timelineEl = timelineRef.current;
    if (timelineEl) {
      const { left, width } = getTaskPosition(task);
      const timelineWidth = timelineEl.offsetWidth;
      const targetScrollLeft = left - (timelineWidth / 2) + (width / 2);
      timelineEl.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p className="text-text-tertiary">Loading Gantt...</p></div>;
  }

  const ganttWidth = differenceInDays(projectEnd, projectStart) * dayWidth;

  // Month headers - calculate directly without useMemo to avoid dependency issues
  const monthHeaders = eachMonthOfInterval({ start: projectStart, end: projectEnd }).map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const start = differenceInDays(monthStart, projectStart) * dayWidth;
    const width = differenceInDays(monthEnd, monthStart) * dayWidth;
    return { name: format(monthStart, 'MMMM yyyy'), left: start, width };
  });

  // Today position - calculate directly
  const todayPosition = differenceInDays(new Date(), projectStart) * dayWidth;

  // Pre-calculate task positions for arrows
  const taskPositions = new Map();
  let posRowIndex = 0;
  phases.forEach(phase => {
    posRowIndex++; // Phase header
    sortedTasks.filter(t => t.phase_id === phase.id).forEach(task => {
      const { left, width } = getTaskPosition(task);
      const taskTop = posRowIndex * 40;
      taskPositions.set(task.id, {
        x: left + width,
        y: taskTop + 20,
        startX: left
      });
      posRowIndex++;
    });
  });

  return (
    <div className="h-full flex flex-col bg-background-secondary rounded-lg border border-border-default" style={{ cursor: resizingTask ? 'ew-resize' : 'default' }}>
      <Tooltip visible={tooltip.visible} content={tooltip.content} x={tooltip.x} y={tooltip.y} />
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={loadData} />}
      {linkingState && <LinkingArrow from={linkingState.from} to={linkingState.to} />}
      <Toaster position="top-right" />
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-border-default">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-lg text-text-primary">Gantt Chart</h3>
          <button onClick={loadData} className="p-2 rounded-md hover:bg-background-tertiary text-text-secondary"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-background-primary border border-border-default rounded-md px-2 py-1 text-sm">
            <option value="order">Default Order</option>
            <option value="name">Name</option>
            <option value="start">Start Date</option>
          </select>
          <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="p-2 rounded-md hover:bg-background-tertiary">-</button>
          <span className="text-sm font-semibold">{(zoomLevel * 100).toFixed(0)}%</span>
          <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="p-2 rounded-md hover:bg-background-tertiary">+</button>
          <div className="border-l border-border-default h-6 mx-2"></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={showCriticalPath} onChange={() => setShowCriticalPath(!showCriticalPath)} />
            Critical Path
          </label>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <div ref={leftPanelRef} onScroll={handleScroll} className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-border-default" style={{ scrollbarWidth: 'none', scrollBehavior: 'auto', willChange: 'scroll-position' }}>
          {/* Left Header */}
          <div className="h-12 flex items-center px-4 sticky top-0 z-20 bg-background-secondary border-b border-border-default">
            <h4 className="font-bold text-text-primary">Tasks</h4>
          </div>
          {/* Task List */}
          <div className="relative">
            {phases.map(phase => (
              <React.Fragment key={phase.id}>
                <div className="h-10 flex items-center p-2 sticky top-12 z-10 bg-background-tertiary border-b border-t border-border-default">
                  <strong className="text-sm text-text-primary">{phase.name}</strong>
                </div>
                {sortedTasks.filter(t => t.phase_id === phase.id).map(task => (
                  <div key={task.id} 
                       className={`h-10 flex items-center justify-between p-2 text-sm border-b border-border-default cursor-pointer transition-all duration-200 ${
                         selectedTask?.id === task.id 
                           ? 'bg-brand-secondary text-text-onPrimary' 
                           : 'hover:bg-background-tertiary'
                       } ${
                         hoveredTask && !highlightedIds.has(task.id) ? 'opacity-30' : 'opacity-100'
                       }`}
                       onClick={() => {
                         setSelectedTask(task);
                         setLocalHighlightedTask(task.id);
                         handleTaskClick(task);
                       }}
                       onMouseEnter={(e) => {
                         setImmediateHoveredTask(task.id);
                         setTooltip({ visible: true, content: task, x: e.pageX, y: e.pageY });
                       }}
                       onMouseLeave={() => {
                         setImmediateHoveredTask(null);
                         setTooltip({ visible: false, content: null, x: 0, y: 0 });
                       }}>
                    <span className='truncate pr-2'>{task.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${task.status === 'DONE' ? 'bg-success-background text-success-text' : 'bg-info-background text-info-text'}`}>{task.status}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div ref={timelineRef} onScroll={handleScroll} className="flex-1 overflow-auto" style={{ scrollBehavior: 'auto', willChange: 'scroll-position' }}>
          <div style={{ width: ganttWidth, position: 'relative' }}>
            {/* Month/Day Headers */}
            <div className="h-12 flex sticky top-0 z-30 bg-background-secondary border-b border-border-default">
              {monthHeaders.map(month => (
                <div key={month.name} style={{ left: month.left, width: month.width }} className="absolute top-0 h-full flex items-center justify-center border-r border-border-default">
                  <span className="font-bold text-sm text-text-primary">{month.name}</span>
                </div>
              ))}
            </div>
            {/* Grid & Task Bars */}
            <div className="relative">
              {/* Sprint Backgrounds */}
              {sprints.map((sprint, index) => {
                const sprintStart = new Date(sprint.start_date);
                const sprintEnd = new Date(sprint.end_date);
                const left = differenceInDays(sprintStart, projectStart) * dayWidth;
                const width = differenceInDays(sprintEnd, sprintStart) * dayWidth;
                return (
                  <div key={sprint.id} style={{ left, width }} className={`absolute top-0 h-full ${index % 2 === 0 ? 'bg-background-tertiary/70' : 'bg-transparent'}`}>
                    <div className='font-bold text-sm text-text-tertiary p-2'>{sprint.name}</div>
                  </div>
                )
              })}
              {/* Vertical Grid Lines */}
              {Array.from({ length: Math.ceil(differenceInDays(projectEnd, projectStart)) }).map((_, i) => (
                <div key={`grid-v-${i}`} style={{ left: i * dayWidth }} className="absolute top-0 h-full w-px bg-border-default/50"></div>
              ))}
              {/* Today Marker - Prominent */}
              {todayPosition >= 0 && (
                <div style={{ left: todayPosition }} className="absolute top-0 h-full z-15">
                  {/* Glow line */}
                  <div className="absolute top-0 h-full w-1 bg-brand-primary shadow-lg" style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}></div>
                  {/* Label */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                    📍 TODAY
                  </div>
                </div>
              )}
              {/* Drop Zone & Horizontal Grid Lines */}
              <div 
                className={`absolute top-0 left-0 w-full h-full transition-colors ${draggedTask ? 'bg-brand-primary/10' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (!taskId) return;
                  
                  const task = tasks.find(t => t.id === taskId);
                  if (!task) return;

                  const timelineRect = timelineRef.current.getBoundingClientRect();
                  const dropX = e.clientX - timelineRect.left + timelineRef.current.scrollLeft;
                  const newStartDate = addDays(projectStart, Math.floor(dropX / dayWidth));
                  
                  // Calculate new due_date based on estimated_hours
                  const durationDays = task.estimated_hours ? Math.max(1, Math.ceil(task.estimated_hours / 8)) : 3;
                  const newDueDate = addDays(newStartDate, durationDays);
                  
                  const { error } = await supabase
                    .from('tasks')
                    .update({ 
                      start_date: newStartDate.toISOString(),
                      due_date: newDueDate.toISOString()
                    })
                    .eq('id', taskId);

                  if (error) {
                    toast.error(`Failed: ${error.message}`);
                  } else {
                    toast.success(`Moved to ${format(newStartDate, 'MMM d')}`);
                    loadData();
                  }
                  setDraggedTask(null);
                }}>
              {(() => {
                let rowIndex = 0;
                return phases.map(phase => (
                  <React.Fragment key={`phase-bars-${phase.id}`}>
                    <div className="h-10 bg-background-tertiary/30 border-b border-t border-border-default"></div>
                    {(() => { rowIndex++; return null; })()}
                    {sortedTasks.filter(t => t.phase_id === phase.id).map(task => {
                      const { left, width } = getTaskPosition(task);
                      rowIndex++;
                      return (
                        <div key={`bar-${task.id}`} className="h-10 relative border-b border-border-default">
                          <div 
                             style={{ left, width, top: 5, height: 30, cursor: resizingTask ? 'ew-resize' : 'move' }} 
                             onClick={() => setSelectedTask(task)}
                             onMouseEnter={(e) => {
                               setImmediateHoveredTask(task.id);
                               setTooltip({ visible: true, content: task, x: e.pageX, y: e.pageY });
                             }}
                             onMouseLeave={() => {
                               setImmediateHoveredTask(null);
                               setTooltip({ visible: false, content: null, x: 0, y: 0 });
                             }}
                             draggable={!linkingState && !resizingTask}
                             onDragStart={(e) => {
                               if (linkingState || resizingTask) {
                                 e.preventDefault();
                                 return;
                               }
                               e.dataTransfer.effectAllowed = 'move';
                               e.dataTransfer.setData('text/plain', task.id);
                               setDraggedTask(task);
                             }}
                             onDragEnd={() => {
                               setDraggedTask(null);
                             }}
                             onDragEnter={() => linkingState && setDropTargetId(task.id)}
                             onDragLeave={() => linkingState && setDropTargetId(null)}
                             onDrop={async (e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               const fromTaskId = e.dataTransfer.getData('dependency/from');
                               const toTaskId = task.id;
                               if (fromTaskId && fromTaskId !== toTaskId) {
                                 const fromTask = tasks.find(t => t.id === fromTaskId);
                                 const toTask = tasks.find(t => t.id === toTaskId);
                                 
                                 if (!fromTask || !toTask) return;
                                 
                                 // Format: "ID: Name" to match DB format
                                 const depString = `${fromTaskId}: ${fromTask.name}`;
                                 
                                 // Check if already exists
                                 const existingDeps = toTask.blocking_dependencies || [];
                                 if (existingDeps.some(d => d.startsWith(`${fromTaskId}:`))) {
                                   toast.error('Dependency already exists!');
                                   return;
                                 }
                                 
                                 const newDependencies = [...existingDeps, depString];
                                 
                                 const { error } = await supabase
                                   .from('tasks')
                                   .update({ blocking_dependencies: newDependencies })
                                   .eq('id', toTaskId);

                                 if (error) {
                                   toast.error(`Failed to link: ${error.message}`);
                                 } else {
                                   toast.success(`Linked: ${fromTask.name} → ${toTask.name}`);
                                   loadData(); // Refresh to show new arrow
                                 }
                               }
                             }}
                             className={`absolute rounded-md flex items-center px-2 text-white text-xs font-semibold shadow-lg cursor-move transition-all duration-200 ${
                               draggedTask?.id === task.id ? 'opacity-50 scale-105' :
                               showCriticalPath && criticalPathIds.has(task.id) 
                                 ? 'bg-gradient-to-r from-red-600 to-red-500 ring-2 ring-red-300 shadow-red-500/50'
                                 : selectedTask?.id === task.id 
                                   ? 'bg-gradient-to-r from-orange-500 to-orange-400 ring-2 ring-orange-300'
                                   : 'bg-gradient-to-r from-blue-600 to-blue-500'
                             } ${
                               linkingState && dropTargetId === task.id ? 'ring-4 ring-green-400 ring-offset-2' : ''
                             } ${
                               hoveredTask && !highlightedIds.has(task.id) ? 'opacity-20' : 'opacity-100'
                             }`}>
                            {/* Left Dependency Handle */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform"></div>
                            
                            {/* Left Resize Handle */}
                            <div 
                              className="absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 transition-colors"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setResizingTask({ id: task.id, side: 'left', startX: e.clientX, originalLeft: left, originalWidth: width });
                              }}
                            ></div>
                            
                            <p className='truncate flex-1'>{task.name}</p>
                            
                            {/* Right Resize Handle */}
                            <div 
                              className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 transition-colors"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setResizingTask({ id: task.id, side: 'right', startX: e.clientX, originalWidth: width });
                              }}
                            ></div>
                            
                            {/* Right Dependency Handle */}
                            <div 
                              draggable 
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('dependency/from', task.id);
                                const fromPos = taskPositions.get(task.id);
                                setLinkingState({ from: fromPos, to: {x: fromPos.x, y: fromPos.y} });
                              }}
                              onDrag={(e) => {
                                e.stopPropagation();
                                if (e.clientX === 0 && e.clientY === 0) return; // Ignore final drag event
                                const timelineRect = timelineRef.current.getBoundingClientRect();
                                const scrollLeft = timelineRef.current.scrollLeft;
                                const scrollTop = timelineRef.current.scrollTop;
                                setLinkingState(prev => ({ 
                                  ...prev, 
                                  to: { 
                                    x: e.clientX - timelineRect.left + scrollLeft, 
                                    y: e.clientY - timelineRect.top + scrollTop 
                                  }
                                }));
                              }}
                              onDragEnd={(e) => {
                                e.stopPropagation();
                                setLinkingState(null);
                                setDropTargetId(null);
                              }}
                              className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform z-10"></div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
              {/* TODO: Re-enable after fixing taskPositions timing issue */}
              {/* <DependencyArrows 
                tasks={sortedTasks} 
                taskPositions={taskPositions}
                hoveredTask={hoveredTask}
                highlightedIds={highlightedIds}
                showCriticalPath={showCriticalPath}
                criticalPathIds={criticalPathIds}
                scrollLeft={scrollLeft}
                scrollTop={scrollTop}
              /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DependencyArrows = ({ tasks, taskPositions, hoveredTask, highlightedIds, showCriticalPath, criticalPathIds, scrollLeft, scrollTop }) => {
  if (!taskPositions || !taskPositions.size) return null;

  const arrows = [];
  tasks.forEach(task => {
    if (task.blocking_dependencies && task.blocking_dependencies.length > 0) {
      const toTaskPos = taskPositions.get(task.id);
      if (!toTaskPos) return;

      task.blocking_dependencies.forEach(depString => {
        // Parse "ID: Name" format to get ID
        const depId = typeof depString === 'string' ? parseInt(depString.split(':')[0]) : depString;
        const fromTaskPos = taskPositions.get(depId);
        if (!fromTaskPos) return;

        // Arrow from end of fromTask to start of toTask
        const fromX = fromTaskPos.x; // Right edge of from task
        const fromY = fromTaskPos.y; // Center Y of from task
        const toX = toTaskPos.startX; // Left edge of to task  
        const toY = toTaskPos.y; // Center Y of to task

        const isHighlighted = hoveredTask && highlightedIds.has(depId) && highlightedIds.has(task.id);
        const isCritical = showCriticalPath && criticalPathIds.has(depId) && criticalPathIds.has(task.id);
        
        // Create smooth curved path - horizontal flow
        const controlOffset = Math.abs(toX - fromX) / 3;
        const path = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
        
        arrows.push({ 
          id: `${depId}-${task.id}`,
          d: path, 
          isHighlighted,
          isCritical,
          fromTask: depId,
          toTask: task.id
        });
      });
    }
  });

  // Calculate total height needed for SVG (all rows + phase headers)
  // Each task = 40px, each phase header = 40px
  const totalRows = tasks.length + (new Set(tasks.map(t => t.phase_id)).size);
  const svgHeight = totalRows * 40 + 100; // Extra padding
  
  return (
    <svg className="absolute top-0 left-0 w-full pointer-events-none" style={{ zIndex: 20, height: `${svgHeight}px` }}>
      <defs>
        <marker id="arrowhead" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto">
          <polygon points="0 0, 12 5, 0 10" fill="#0ea5e9" />
        </marker>
        <marker id="arrowhead-highlight" markerWidth="12" markerHeight="10" refX="12" refY="5" orient="auto">
          <polygon points="0 0, 12 5, 0 10" fill="#fb923c" />
        </marker>
        <marker id="arrowhead-critical" markerWidth="14" markerHeight="12" refX="14" refY="6" orient="auto">
          <polygon points="0 0, 14 6, 0 12" fill="#ef4444" />
        </marker>
        {/* Glow filters for critical path */}
        <filter id="glow-critical">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {arrows.map(arrow => (
        <g key={arrow.id}>
          {/* Shadow/glow for critical path */}
          {arrow.isCritical && (
            <path 
              d={arrow.d} 
              stroke="#ef4444" 
              strokeWidth="6" 
              fill="none" 
              opacity="0.3"
              filter="url(#glow-critical)"
            />
          )}
          {/* Main arrow */}
          <path 
            d={arrow.d} 
            stroke={arrow.isCritical ? '#ef4444' : arrow.isHighlighted ? '#fb923c' : '#0ea5e9'} 
            strokeWidth={arrow.isCritical ? 4 : arrow.isHighlighted ? 3 : 2} 
            fill="none" 
            markerEnd={arrow.isCritical ? 'url(#arrowhead-critical)' : arrow.isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'} 
            className={`transition-all duration-300 ${
              hoveredTask && !arrow.isHighlighted ? 'opacity-10' : 'opacity-100'
            }`}
            strokeDasharray={arrow.isCritical ? '0' : '0'}
          />
        </g>
      ))}
    </svg>
  );
};

const Tooltip = ({ visible, content, x, y }) => {
  if (!visible || !content) return null;
  return (
    <div 
      className="fixed p-3 bg-background-primary border border-border-default rounded-lg shadow-2xl max-w-xs z-50 pointer-events-none"
      style={{ top: y + 15, left: x + 15 }}
    >
      <h4 className="font-bold text-text-primary mb-2">{content.name}</h4>
      <p className="text-sm text-text-secondary mb-1"><strong>Status:</strong> {content.status}</p>
      {content.started_at && <p className="text-sm text-text-secondary mb-1"><strong>Start:</strong> {format(new Date(content.started_at), 'MMM d, yyyy')}</p>}
      {content.completed_at && <p className="text-sm text-text-secondary mb-1"><strong>End:</strong> {format(new Date(content.completed_at), 'MMM d, yyyy')}</p>}
      <p className="text-sm text-text-secondary"><strong>Estimate:</strong> {content.estimated_hours} hours</p>
    </div>
  );
};

const LinkingArrow = ({ from, to }) => {
  if (!from || !to) return null;
  
  const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 25 }}>
      <defs>
        <marker id="arrowhead-linking" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="#fb923c" />
        </marker>
      </defs>
      <path 
        d={path} 
        stroke="#fb923c" 
        strokeWidth="3" 
        fill="none" 
        strokeDasharray="8,4"
        markerEnd="url(#arrowhead-linking)"
      />
    </svg>
  );
};

// TaskModal removed - now using TaskDetailModal imported from ./TaskDetailModal
