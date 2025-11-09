import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, isToday, startOfDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { TaskDetailModal } from './TaskDetailModal';

/**
 * CustomGanttPro - Professional Gantt Chart Component
 * 
 * ✅ FULL FEATURES:
 * - View modes: Day/Week/Month (dynamic zoom)
 * - Today marker (vertical red line with label)
 * - Milestone diamonds (yellow ◆ for is_milestone tasks)
 * - 2-tier timeline header (Month + Week/Day)
 * - Hierarchy support (parent-child tasks with indentation)
 * - Expand/Collapse phases and parent tasks
 * - Proper sorting (Priority/Start/End/Duration)
 * - Progress bars inside tasks (dark overlay)
 * - Color by status (Green=DONE, Blue=IN_PROGRESS, Gray=PENDING)
 * - Dependency arrows (SVG arrows with markers)
 * - Drag & Drop tasks (move dates)
 * - Resize task bars (change duration)
 * - Resource labels (show assigned_to on bars)
 * - Baseline comparison (planned vs actual)
 * - Grid lines (vertical guides)
 * - Tooltips (hover for full task info)
 * - Smooth scrolling and sync
 */
export const CustomGanttPro = () => {
  // ==================== STATE ====================
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('gantt_viewMode') || 'day');
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'start' | 'end' | 'duration'
  const [showCriticalPath, setShowCriticalPath] = useState(() => localStorage.getItem('gantt_showCriticalPath') === 'true');
  const [showDependencies, setShowDependencies] = useState(() => localStorage.getItem('gantt_showDependencies') !== 'false');
  const [showBaseline, setShowBaseline] = useState(() => localStorage.getItem('gantt_showBaseline') === 'true');
  const [collapsedPhases, setCollapsedPhases] = useState(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState(new Set());
  const [draggedTask, setDraggedTask] = useState(null);
  const [resizingTask, setResizingTask] = useState(null);
  const [resizeEdge, setResizeEdge] = useState(null); // 'left' or 'right'
  const [dragStartX, setDragStartX] = useState(0);
  const [tooltip, setTooltip] = useState({ visible: false, task: null, x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState({ visible: false, task: null, x: 0, y: 0 });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [hasDragged, setHasDragged] = useState(false);
  const [taskColumnCollapsed, setTaskColumnCollapsed] = useState(() => localStorage.getItem('gantt_taskColumnCollapsed') === 'true');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(() => parseFloat(localStorage.getItem('gantt_zoomLevel')) || 1);
  
  // Smart zoom: Auto-switch view mode based on zoom level
  // DISABLED during drag to prevent dayWidth changes!
  useEffect(() => {
    // Don't auto-switch while dragging - it messes up calculations!
    if (draggedTask || resizingTask) return;
    
    // Auto-adjust view mode based on zoom level for better visibility
    if (zoomLevel >= 1.5 && viewMode === 'month') {
      setViewMode('week');
    } else if (zoomLevel >= 1.5 && viewMode === 'week') {
      setViewMode('day');
    } else if (zoomLevel >= 1.8 && viewMode === 'day') {
      setViewMode('hour');
    } else if (zoomLevel <= 0.7 && viewMode === 'hour') {
      setViewMode('day');
    } else if (zoomLevel <= 0.7 && viewMode === 'day') {
      setViewMode('week');
    } else if (zoomLevel <= 0.5 && viewMode === 'week') {
      setViewMode('month');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel, draggedTask, resizingTask]); // Don't switch during drag!
  const [highlightedTask, setHighlightedTask] = useState(null); // For visual highlight before modal
  const [originalDraggedTask, setOriginalDraggedTask] = useState(null); // Store original task state for revert
  const originalStartDateRef = useRef(null); // Store original start date for smooth drag calculation
  const originalEndDateRef = useRef(null); // Store original end date for smooth resize calculation
  
  const timelineRef = useRef(null);
  const leftPanelRef = useRef(null);
  const modalTimerRef = useRef(null);
  const lastDragUpdateRef = useRef(0); // Throttle drag updates

  // ==================== STATE PERSISTENCE ====================
  // Debug: Log initial state on mount (ONCE only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Gantt State Restored:', {
        viewMode,
        zoomLevel,
        showCriticalPath,
        showDependencies,
        showBaseline,
        taskColumnCollapsed
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run ONCE on mount only

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gantt_viewMode', viewMode);
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Saved viewMode:', viewMode);
    }
  }, [viewMode]);

  // Auto-scroll to Today when view mode changes (after dayWidth is calculated)
  useEffect(() => {
    if (!loading && timelineRef.current && tasks.length > 0 && projectDates) {
      // Small delay to ensure dayWidth is calculated
      setTimeout(() => {
        if (!timelineRef.current) return;
        
        // Calculate today's position
        const today = startOfDay(new Date());
        const daysFromStart = differenceInDays(today, projectDates.start);
        
        // Calculate dayWidth inline to avoid dependency issues
        let baseWidth;
        switch (viewMode) {
          case 'hour': baseWidth = 200; break;
          case 'day': baseWidth = 60; break;
          case 'week': baseWidth = 20; break;
          case 'month': baseWidth = 15; break;
          default: baseWidth = 60;
        }
        const currentDayWidth = baseWidth * zoomLevel;
        const todayX = daysFromStart * currentDayWidth;
        
        // Scroll to center today in viewport
        const viewportWidth = timelineRef.current.clientWidth;
        const scrollLeft = Math.max(0, todayX - viewportWidth / 2);
        
        timelineRef.current.scrollLeft = scrollLeft;
      }, 100);
    }
  }, [viewMode, zoomLevel, loading, tasks.length]); // Re-center when view mode or zoom changes

  useEffect(() => {
    localStorage.setItem('gantt_zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    localStorage.setItem('gantt_showCriticalPath', showCriticalPath.toString());
  }, [showCriticalPath]);

  useEffect(() => {
    localStorage.setItem('gantt_showDependencies', showDependencies.toString());
  }, [showDependencies]);

  useEffect(() => {
    localStorage.setItem('gantt_showBaseline', showBaseline.toString());
  }, [showBaseline]);

  useEffect(() => {
    localStorage.setItem('gantt_taskColumnCollapsed', taskColumnCollapsed.toString());
  }, [taskColumnCollapsed]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && timelineRef.current) {
      const savedScrollLeft = localStorage.getItem('gantt_scrollLeft');
      const savedScrollTop = localStorage.getItem('gantt_scrollTop');
      if (savedScrollLeft) timelineRef.current.scrollLeft = parseInt(savedScrollLeft);
      if (savedScrollTop) timelineRef.current.scrollTop = parseInt(savedScrollTop);
    }
  }, [loading]);

  // Save scroll position on scroll
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleScroll = () => {
      localStorage.setItem('gantt_scrollLeft', timeline.scrollLeft.toString());
      localStorage.setItem('gantt_scrollTop', timeline.scrollTop.toString());
    };

    timeline.addEventListener('scroll', handleScroll);
    return () => timeline.removeEventListener('scroll', handleScroll);
  }, []);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    loadData();
    
    // Cleanup timer on unmount
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Esc - Close modal/context menu
      if (e.key === 'Escape') {
        setSelectedTask(null);
        setContextMenu({ visible: false, task: null, x: 0, y: 0 });
      }
      // Delete - Delete selected task (with confirmation)
      if (e.key === 'Delete' && selectedTask) {
        if (window.confirm(`Delete task "${selectedTask.name}"?`)) {
          deleteTask(selectedTask.id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, task: null, x: 0, y: 0 });
    if (contextMenu.visible) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  // Sync scroll between left panel and timeline
  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const timeline = timelineRef.current;
    
    if (!leftPanel || !timeline) return;
    
    const syncScroll = (source, target) => {
      return () => {
        target.scrollTop = source.scrollTop;
      };
    };
    
    const leftToTimeline = syncScroll(leftPanel, timeline);
    const timelineToLeft = syncScroll(timeline, leftPanel);
    
    leftPanel.addEventListener('scroll', leftToTimeline);
    timeline.addEventListener('scroll', timelineToLeft);
    
    return () => {
      leftPanel.removeEventListener('scroll', leftToTimeline);
      timeline.removeEventListener('scroll', timelineToLeft);
    };
  }, []);

  // Mouse wheel zoom (Ctrl/Cmd + Wheel)
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleWheel = (e) => {
      // Only zoom if Ctrl or Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
      }
    };

    timeline.addEventListener('wheel', handleWheel, { passive: false });
    return () => timeline.removeEventListener('wheel', handleWheel);
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
  
  // Calculate project date range - use actual dates, not month boundaries
  const projectDates = useMemo(() => {
    if (!tasks.length) {
      const today = startOfDay(new Date());
      return {
        start: addDays(today, -30), // 30 days before today
        end: addDays(today, 90)     // 90 days after today
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

    // Add padding: 7 days before earliest, 30 days after latest
    return {
      start: startOfDay(addDays(minDate, -7)),
      end: startOfDay(addDays(maxDate, 30))
    };
  }, [tasks]);

  // Calculate day width based on view mode and zoom
  const dayWidth = useMemo(() => {
    let baseWidth;
    switch (viewMode) {
      case 'hour': baseWidth = 200; break; // 200px per day, show hours
      case 'day': baseWidth = 60; break;   // 60px per day
      case 'week': baseWidth = 20; break;  // 20px per day
      case 'month': baseWidth = 15; break; // 15px per day (increased from 10 for better visibility)
      default: baseWidth = 60;
    }
    return baseWidth * zoomLevel;
  }, [viewMode, zoomLevel]);

  // Calculate row height based on view mode (taller rows in month view to prevent overlap)
  const rowHeight = useMemo(() => {
    switch (viewMode) {
      case 'hour': return 48; // Tall for detailed view
      case 'day': return 40;  // Standard
      case 'week': return 36; // Compact
      case 'month': return 24; // Very compact but still visible
      default: return 40;
    }
  }, [viewMode]);

  // Sort and flatten tasks with hierarchy
  const sortedTasks = useMemo(() => {
    // Apply filters first
    let filtered = [...tasks];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.assigned_to?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    // Priority filter
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    
    // Then sort
    const sorted = filtered.sort((a, b) => {
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
  }, [tasks, sortBy, collapsedTasks, filterStatus, filterPriority, searchQuery]);

  // Get task position (with TIMESTAMP support for hour precision)
  const getTaskPosition = (task) => {
    // Use new TIMESTAMP columns first, fallback to DATE columns
    const startDate = task.start_datetime ? new Date(task.start_datetime) :
                     task.start_date ? new Date(task.start_date) : 
                     task.started_at ? new Date(task.started_at) : new Date();
    const duration = task.estimated_hours ? Math.max(1, Math.ceil(task.estimated_hours / 8)) : 3;
    const endDate = task.due_datetime ? new Date(task.due_datetime) :
                   task.due_date ? new Date(task.due_date) :
                   task.completed_at ? new Date(task.completed_at) : addDays(startDate, duration);
    
    // Calculate position with HOUR precision (not just days)
    const startDiff = (startDate.getTime() - projectDates.start.getTime()) / (1000 * 60 * 60 * 24);
    const endDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const left = startDiff * dayWidth;
    const width = Math.max(endDiff * dayWidth, dayWidth / 24); // Min 1 hour width
    
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
    // Clear any pending modal timer
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }
    
    // Immediately highlight the task
    setHighlightedTask(task);
    
    // Scroll to task
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
    
    // DO NOT open modal for task list clicks - only highlight and scroll
  };

  const handleBarClick = (task, e) => {
    if (e) e.stopPropagation();
    
    // Only open modal if NOT dragged
    if (!hasDragged) {
      setHighlightedTask(task);
      setSelectedTask(task);
    }
    setHasDragged(false); // Reset for next interaction
  };

  const handleBarRightClick = (task, e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      task,
      x: e.clientX,
      y: e.clientY
    });
  };

  const scrollToToday = () => {
    const timelineEl = timelineRef.current;
    if (timelineEl) {
      const timelineWidth = timelineEl.offsetWidth;
      const targetScrollLeft = Math.max(0, todayPosition - (timelineWidth / 2));
      timelineEl.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  };

  const exportToPNG = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const ganttElement = document.querySelector('.gantt-export-area');
      if (!ganttElement) {
        toast.error('Gantt chart not found');
        return;
      }
      
      toast.loading('Exporting to PNG...');
      const canvas = await html2canvas(ganttElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.dismiss();
      toast.success('Exported to PNG!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Drag & Drop handlers
  const handleBarMouseDown = (e, task, edge = null) => {
    e.preventDefault();
    e.stopPropagation();
    setHasDragged(false); // Reset drag flag
    setTooltip({ visible: false, task: null, x: 0, y: 0 }); // Hide tooltip during drag
    setHoveredTask(null); // Clear hover state
    
    // PREVENT DRAG: Check if task has unfinished dependencies (only for drag, not resize)
    if (!edge) {
      const deps = getTaskDependencies(task);
      const hasUnfinishedDeps = deps.some(d => d.status !== 'DONE');
      
      if (hasUnfinishedDeps) {
        const depNames = deps.filter(d => d.status !== 'DONE').map(d => d.name).slice(0, 3).join(', ');
        const moreCount = Math.max(0, deps.filter(d => d.status !== 'DONE').length - 3);
        toast.warning(
          `⚠️ Complete dependencies first!\n${depNames}${moreCount > 0 ? ` + ${moreCount} more` : ''}`,
          { duration: 3000 }
        );
        return; // Don't start drag
      }
    }
    
    // Store original task state for potential revert
    setOriginalDraggedTask({ ...task });
    
    // Store original start/end dates for smooth drag calculation (use TIMESTAMP if available)
    originalStartDateRef.current = task.start_datetime ? new Date(task.start_datetime) :
                                   new Date(task.start_date || task.started_at);
    originalEndDateRef.current = task.due_datetime ? new Date(task.due_datetime) :
                                 new Date(task.due_date || task.completed_at);
    
    if (edge) {
      setResizingTask(task);
      setResizeEdge(edge);
      document.body.style.cursor = 'col-resize'; // Global cursor
    } else {
      setDraggedTask(task);
      document.body.style.cursor = 'grabbing'; // Global cursor
    }
    setDragStartX(e.clientX);
    
    // Attach global listeners for drag/resize
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!draggedTask && !resizingTask) return;
    
    e.preventDefault();
    
    // NO THROTTLE for ultra-smooth drag!
    // Update on EVERY mousemove for maximum responsiveness
    
    if (draggedTask) {
      const deltaX = e.clientX - dragStartX;
      
      // ULTRA RESPONSIVE: Trigger on ANY movement (1px threshold)
      // Mark as dragged immediately on any movement
      if (Math.abs(deltaX) > 1) {
        setHasDragged(true);
        
        // Calculate delta in FRACTIONAL hours/minutes for ultra-smooth movement
        let deltaHours = 0;
        if (viewMode === 'hour') {
          // In hour view: Support MINUTE precision at high zoom!
          const hourWidth = dayWidth / 24;
          const minuteWidth = hourWidth / 60; // 1 minute width
          
          // At high zoom (>= 2.5), use MINUTE precision
          if (zoomLevel >= 2.5) {
            const deltaMinutes = deltaX / minuteWidth;
            deltaHours = deltaMinutes / 60; // Convert minutes to hours
          } else {
            deltaHours = deltaX / hourWidth; // Hour precision
          }
        } else if (viewMode === 'day') {
          // In day view: 1 day = dayWidth, convert to hours (1 day = 24 hours)
          const deltaDays = deltaX / dayWidth;
          deltaHours = deltaDays * 24; // Keep as float
        } else {
          // Week/Month view: use days
          const deltaDays = deltaX / dayWidth;
          deltaHours = deltaDays * 24;
        }
        
        // ULTRA SMOOTH: Update visual on every movement!
        // Calculate new position based on ORIGINAL start date + total delta
        const originalStartDate = originalStartDateRef.current || 
                                 (draggedTask.start_datetime ? new Date(draggedTask.start_datetime) : new Date(draggedTask.start_date || draggedTask.started_at));
        // Add EXACT hours from original position (no rounding)
        const newStartDate = new Date(originalStartDate.getTime() + deltaHours * 60 * 60 * 1000);
        const duration = draggedTask.estimated_hours ? Math.ceil(draggedTask.estimated_hours / 8) : 3;
        const newEndDate = addDays(newStartDate, duration);
        
        // Update with FULL TIMESTAMP (not just date!)
        setTasks(prev => prev.map(t => 
          t.id === draggedTask.id 
            ? { 
                ...t, 
                start_datetime: newStartDate.toISOString(),
                due_datetime: newEndDate.toISOString(),
                // Keep old columns for compatibility
                start_date: format(newStartDate, 'yyyy-MM-dd'), 
                due_date: format(newEndDate, 'yyyy-MM-dd')
              }
            : t
        ));
        setDraggedTask({ 
          ...draggedTask, 
          start_datetime: newStartDate.toISOString(),
          due_datetime: newEndDate.toISOString(),
          start_date: format(newStartDate, 'yyyy-MM-dd'), 
          due_date: format(newEndDate, 'yyyy-MM-dd')
        });
        // DON'T reset dragStartX - keep original reference point!
      }
    } else if (resizingTask && resizeEdge) {
      const deltaX = e.clientX - dragStartX;
      
      // ULTRA RESPONSIVE: Mark as dragged on any movement
      if (Math.abs(deltaX) > 1) {
        setHasDragged(true);
        
        // Calculate delta in FRACTIONAL hours/minutes for ultra-smooth movement
        let deltaHours = 0;
        if (viewMode === 'hour') {
          // In hour view: Support MINUTE precision at high zoom!
          const hourWidth = dayWidth / 24;
          const minuteWidth = hourWidth / 60; // 1 minute width
          
          // At high zoom (>= 2.5), use MINUTE precision
          if (zoomLevel >= 2.5) {
            const deltaMinutes = deltaX / minuteWidth;
            deltaHours = deltaMinutes / 60; // Convert minutes to hours
          } else {
            deltaHours = deltaX / hourWidth; // Hour precision
          }
        } else if (viewMode === 'day') {
          const deltaDays = deltaX / dayWidth;
          deltaHours = deltaDays * 24; // Keep as float
        } else {
          const deltaDays = deltaX / dayWidth;
          deltaHours = deltaDays * 24;
        }
        
        // ULTRA SMOOTH: Update visual on every movement!
        // Use ORIGINAL dates, not updated ones!
        const originalStartDate = originalStartDateRef.current || 
                                 (resizingTask.start_datetime ? new Date(resizingTask.start_datetime) : new Date(resizingTask.start_date || resizingTask.started_at));
        const originalEndDate = originalEndDateRef.current ||
                               (resizingTask.due_datetime ? new Date(resizingTask.due_datetime) : new Date(resizingTask.due_date || resizingTask.completed_at));
        
        let newStartDate = originalStartDate;
        let newEndDate = originalEndDate;
        
        if (resizeEdge === 'left') {
          // Add EXACT hours from ORIGINAL start date
          newStartDate = new Date(originalStartDate.getTime() + deltaHours * 60 * 60 * 1000);
          if (newStartDate >= originalEndDate) {
            newStartDate = new Date(originalEndDate.getTime() - 60 * 60 * 1000); // 1 hour before end
          }
        } else {
          // Add EXACT hours from ORIGINAL end date
          newEndDate = new Date(originalEndDate.getTime() + deltaHours * 60 * 60 * 1000);
          if (newEndDate <= originalStartDate) {
            newEndDate = new Date(originalStartDate.getTime() + 60 * 60 * 1000); // 1 hour after start
          }
        }
        
        // Update with FULL TIMESTAMP
        setTasks(prev => prev.map(t => 
          t.id === resizingTask.id 
            ? { 
                ...t, 
                start_datetime: newStartDate.toISOString(),
                due_datetime: newEndDate.toISOString(),
                start_date: format(newStartDate, 'yyyy-MM-dd'), 
                due_date: format(newEndDate, 'yyyy-MM-dd')
              }
            : t
        ));
        setResizingTask({ 
          ...resizingTask, 
          start_datetime: newStartDate.toISOString(),
          due_datetime: newEndDate.toISOString(),
          start_date: format(newStartDate, 'yyyy-MM-dd'), 
          due_date: format(newEndDate, 'yyyy-MM-dd')
        });
        // DON'T reset dragStartX - keep original reference point!
      }
    }
  };

  const handleMouseUp = async () => {
    console.log('🖱️ MouseUp - hasDragged:', hasDragged);
    
    // Remove global listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset cursor
    document.body.style.cursor = '';
    
    // Only save if actually dragged (not just clicked)
    if (hasDragged) {
      if (draggedTask) {
        console.log('💾 Saving drag:', draggedTask.name);
        const success = await updateTaskDates(draggedTask.id, new Date(draggedTask.start_date), new Date(draggedTask.due_date));
        // If validation failed, revert will happen in updateTaskDates
      }
      if (resizingTask) {
        console.log('💾 Saving resize:', resizingTask.name);
        const success = await updateTaskDates(resizingTask.id, new Date(resizingTask.start_date), new Date(resizingTask.due_date));
        // If validation failed, revert will happen in updateTaskDates
      }
    }
    
    setDraggedTask(null);
    setResizingTask(null);
    setResizeEdge(null);
    setOriginalDraggedTask(null);
    originalStartDateRef.current = null; // Clear original date references
    originalEndDateRef.current = null;
    console.log('✅ MouseUp complete');
  };

  const updateTaskDates = async (taskId, startDate, endDate) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // VALIDATION: Check if task has dependencies (predecessors)
      // Note: Drag is already prevented in handleBarMouseDown for tasks with unfinished deps
      // This validation is for resize (which is allowed) and edge cases
      const deps = getTaskDependencies(task);
      if (deps.length > 0) {
        // Find latest end date of all predecessors
        const latestPredecessorEnd = new Date(Math.max(...deps.map(d => new Date(d.due_date || d.completed_at))));
        
        // Task cannot start before predecessors finish
        if (startDate < latestPredecessorEnd) {
          toast.error(`⚠️ Cannot start before dependencies finish!\nEarliest start: ${format(latestPredecessorEnd, 'MMM d, yyyy')}`, {
            duration: 4000
          });
          
          // LOCAL REVERT: No reload, just revert to original state
          if (originalDraggedTask) {
            setTasks(prev => prev.map(t => 
              t.id === originalDraggedTask.id ? originalDraggedTask : t
            ));
          }
          return false; // Indicate failure
        }
      }

      // Update this task with TIMESTAMP
      const { error } = await supabase
        .from('tasks')
        .update({ 
          start_datetime: startDate.toISOString(),
          due_datetime: endDate.toISOString(),
          // Keep old columns for compatibility
          start_date: format(startDate, 'yyyy-MM-dd'),
          due_date: format(endDate, 'yyyy-MM-dd')
        })
        .eq('id', taskId);
      
      if (error) throw error;

      // AUTO-CASCADE: Find tasks that depend on this one (successors)
      const successors = tasks.filter(t => {
        const taskDeps = t.depends_on; // ONLY use depends_on (actual DB field)
        if (!taskDeps) return false;
        const depArray = Array.isArray(taskDeps) ? taskDeps : [taskDeps];
        return depArray.includes(taskId);
      });

      // If moving this task forward, push successors forward too
      if (successors.length > 0) {
        const shouldCascade = window.confirm(
          `This task has ${successors.length} dependent task(s).\n\nAuto-adjust their dates too?`
        );

        if (shouldCascade) {
          for (const successor of successors) {
            const successorStart = new Date(successor.start_date || successor.started_at);
            const successorEnd = new Date(successor.due_date || successor.completed_at);
            const duration = differenceInDays(successorEnd, successorStart);

            // New start = this task's end date + 1 day
            const newStart = addDays(endDate, 1);
            const newEnd = addDays(newStart, duration);

            await supabase
              .from('tasks')
              .update({
                start_datetime: newStart.toISOString(),
                due_datetime: newEnd.toISOString(),
                start_date: format(newStart, 'yyyy-MM-dd'),
                due_date: format(newEnd, 'yyyy-MM-dd')
              })
              .eq('id', successor.id);
          }

          toast.success(`✅ Updated task + ${successors.length} dependent task(s)`, {
            duration: 3000,
            position: 'bottom-right'
          });
          
          // Reload to show cascaded changes
          await loadData();
        } else {
          toast.success('✅ Task dates updated', {
            duration: 2000,
            position: 'bottom-right'
          });
        }
      } else {
        toast.success('✅ Task dates updated', {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Error updating task dates:', error);
      toast.error('Failed to update task dates');
      
      // LOCAL REVERT: No reload, just revert to original state
      if (originalDraggedTask) {
        setTasks(prev => prev.map(t => 
          t.id === originalDraggedTask.id ? originalDraggedTask : t
        ));
      }
      return false; // Indicate failure
    }
    return true; // Indicate success
  };

  const deleteTask = async (taskId) => {
    try {
      // Check if other tasks depend on this one
      const dependents = tasks.filter(t => {
        const taskDeps = t.depends_on; // ONLY use depends_on (actual DB field)
        if (!taskDeps) return false;
        const depArray = Array.isArray(taskDeps) ? taskDeps : [taskDeps];
        return depArray.includes(taskId);
      });

      if (dependents.length > 0) {
        const dependentNames = dependents.map(t => t.name).join('\n- ');
        const confirmed = window.confirm(
          `⚠️ WARNING: ${dependents.length} task(s) depend on this!\n\n- ${dependentNames}\n\nDeleting will break dependencies. Continue?`
        );
        if (!confirmed) return;
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      await loadData();
      setSelectedTask(null);
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const duplicateTask = async (task) => {
    try {
      const { id, created_at, updated_at, ...taskData } = task;
      const { error } = await supabase
        .from('tasks')
        .insert({ 
          ...taskData,
          name: `${task.name} (Copy)`,
          status: 'PENDING'
        });
      
      if (error) throw error;
      await loadData();
      toast.success('Task duplicated');
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast.error('Failed to duplicate task');
    }
  };

  // Calculate critical path - longest chain of dependent tasks
  const calculateCriticalPath = useMemo(() => {
    if (!showCriticalPath || tasks.length === 0) return new Set();
    
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const durations = new Map();
    const criticalTasks = new Set();
    
    // Calculate duration for each task
    const getDuration = (task) => {
      if (durations.has(task.id)) return durations.get(task.id);
      
      const taskDuration = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 3;
      
      // Use ONLY depends_on (actual DB field)
      const deps = task.depends_on;
      
      // If no dependencies, duration is just task duration
      if (!deps || deps.length === 0) {
        durations.set(task.id, taskDuration);
        return taskDuration;
      }
      
      // Find max duration path through dependencies
      let maxDepDuration = 0;
      deps.forEach(depId => {
        const depTask = taskMap.get(depId);
        if (depTask) {
          const depDuration = getDuration(depTask);
          if (depDuration > maxDepDuration) maxDepDuration = depDuration;
        }
      });
      
      const totalDuration = maxDepDuration + taskDuration;
      durations.set(task.id, totalDuration);
      return totalDuration;
    };
    
    // Calculate all durations
    tasks.forEach(task => getDuration(task));
    
    // Find tasks with max duration (critical path)
    const maxDuration = Math.max(...Array.from(durations.values()));
    
    // Trace back critical path
    const traceCriticalPath = (task) => {
      if (criticalTasks.has(task.id)) return;
      
      const taskDuration = durations.get(task.id);
      if (taskDuration === maxDuration || criticalTasks.size > 0) {
        criticalTasks.add(task.id);
        
        // Use ONLY depends_on (actual DB field)
        const deps = task.depends_on;
        if (deps) {
          deps.forEach(depId => {
            const depTask = taskMap.get(depId);
            if (depTask && durations.get(depId) === taskDuration - (task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 3)) {
              traceCriticalPath(depTask);
            }
          });
        }
      }
    };
    
    // Start from tasks with max duration
    tasks.forEach(task => {
      if (durations.get(task.id) === maxDuration) {
        traceCriticalPath(task);
      }
    });
    
    return criticalTasks;
  }, [tasks, showCriticalPath]);

  // Auto-schedule: Calculate optimal dates based on dependencies
  const autoSchedule = async () => {
    try {
      toast.loading('Auto-scheduling tasks...');
      
      const updates = [];
      const taskMap = new Map(tasks.map(t => [t.id, t]));
      const scheduled = new Map();
      
      // Helper: Get earliest start date for a task
      const getEarliestStart = (task) => {
        if (scheduled.has(task.id)) return scheduled.get(task.id);
        
        // Use ONLY depends_on (actual DB field)
        const deps = task.depends_on;
        
        // If no dependencies, start today
        if (!deps || deps.length === 0) {
          const startDate = new Date();
          scheduled.set(task.id, startDate);
          return startDate;
        }
        
        // Find latest end date of all dependencies
        let latestEnd = new Date();
        deps.forEach(depId => {
          const depTask = taskMap.get(depId);
          if (depTask) {
            const depStart = getEarliestStart(depTask);
            const depDuration = depTask.estimated_hours ? Math.ceil(depTask.estimated_hours / 8) : 3;
            const depEnd = addDays(depStart, depDuration);
            if (depEnd > latestEnd) latestEnd = depEnd;
          }
        });
        
        // Start 1 day after latest dependency ends
        const startDate = addDays(latestEnd, 1);
        scheduled.set(task.id, startDate);
        return startDate;
      };
      
      // Schedule all tasks
      tasks.forEach(task => {
        const startDate = getEarliestStart(task);
        const duration = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 3;
        const endDate = addDays(startDate, duration);
        
        updates.push({
          id: task.id,
          start_date: format(startDate, 'yyyy-MM-dd'),
          due_date: format(endDate, 'yyyy-MM-dd')
        });
      });
      
      // Batch update
      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ 
            start_date: update.start_date,
            due_date: update.due_date
          })
          .eq('id', update.id);
      }
      
      await loadData();
      toast.dismiss();
      toast.success(`Auto-scheduled ${updates.length} tasks!`);
    } catch (error) {
      console.error('Auto-schedule error:', error);
      toast.dismiss();
      toast.error('Failed to auto-schedule');
    }
  };

  // Get task dependencies
  // DB field: depends_on (array of task IDs)
  const getTaskDependencies = (task) => {
    if (!task) return [];
    
    const deps = task.depends_on;
    
    if (!deps || (Array.isArray(deps) && deps.length === 0)) return [];
    
    // Handle both array and single ID
    const depArray = Array.isArray(deps) ? deps : [deps];
    
    return depArray
      .map(depId => tasks.find(t => t.id === depId))
      .filter(Boolean);
  };

  // Render dependency arrows (with proper Y positioning accounting for phases)
  const renderDependencyArrows = () => {
    if (!showDependencies) return null;
    if (!tasks.length || !phases.length) return null; // Wait for data
    
    const arrows = [];
    
    // Calculate total gantt width with zoom
    const totalDays = differenceInDays(projectDates.end, projectDates.start);
    const scaledGanttWidth = totalDays * dayWidth;
    
    // Build a map of task ID to Y position (accounting for bar vertical centering)
    const taskYPositions = new Map();
    let currentY = 40; // Start after first phase header
    let totalHeight = 40;
    
    phases.forEach(phase => {
      const phaseTasks = sortedTasks.filter(t => t.phase_id === phase.id);
      
      if (!collapsedPhases.has(phase.id)) {
        phaseTasks.forEach((task, idx) => {
          // Calculate bar height and top offset (same as in render)
          const barHeight = Math.max(rowHeight - 10, 20);
          const barTop = (rowHeight - barHeight) / 2;
          // Center of the actual bar (not row)
          const taskCenterY = currentY + idx * rowHeight + barTop + barHeight / 2;
          taskYPositions.set(task.id, taskCenterY);
        });
        currentY += phaseTasks.length * rowHeight;
        totalHeight = currentY;
      }
      currentY += 40; // Phase header height
      totalHeight += 40;
    });
    
    // Now render arrows using the position map
    sortedTasks.forEach(task => {
      const deps = getTaskDependencies(task);
      if (deps.length === 0) return;
      
      const toY = taskYPositions.get(task.id);
      if (!toY) return; // Task is collapsed or filtered out
      
      const toPos = getTaskPosition(task);
      if (!toPos) return; // Position calculation failed
      
      deps.forEach(depTask => {
        const fromY = taskYPositions.get(depTask.id);
        if (!fromY) return; // Dependency task is collapsed or filtered out
        
        const fromPos = getTaskPosition(depTask);
        if (!fromPos) return; // Position calculation failed
        
        // Determine if this is a critical dependency
        const isCritical = task.priority === 'HIGH' || depTask.priority === 'HIGH';
        
        arrows.push(
          <g key={`arrow-${depTask.id}-${task.id}`}>
            <line 
              x1={fromPos.left + fromPos.width} 
              y1={fromY} 
              x2={toPos.left} 
              y2={toY}
              stroke={isCritical ? "#dc2626" : "#3b82f6"} 
              strokeWidth={isCritical ? "4" : "3"}
              markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
              opacity="0.9"
              className="transition-all hover:opacity-100"
            />
          </g>
        );
      });
    });
    
    console.log(`🔍 Arrows Debug: ${arrows.length} arrows rendered, ${taskYPositions.size} tasks positioned`);
    
    if (arrows.length === 0) {
      console.warn('⚠️ No arrows to render - check if tasks have depends_on field');
      return null;
    }
    
    return (
      <svg 
        className="absolute top-0 left-0 pointer-events-none z-20"
        style={{ 
          width: '100%',
          height: '100%',
          minWidth: scaledGanttWidth,
          minHeight: totalHeight
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill="#3b82f6" />
          </marker>
          <marker
            id="arrowhead-critical"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <polygon points="0 0, 10 5, 0 10" fill="#dc2626" />
          </marker>
        </defs>
        {arrows}
      </svg>
    );
  };

  // ==================== TIMELINE HEADERS ====================
  
  const renderTimelineHeaders = () => {
    const totalDays = differenceInDays(projectDates.end, projectDates.start);
    const ganttWidth = totalDays * dayWidth;

    if (viewMode === 'hour') {
      // Hour view: Day + Hours (24 hours per day)
      // At high zoom (>= 2.5), show MINUTES!
      const days = eachDayOfInterval({ start: projectDates.start, end: projectDates.end });
      const hourWidth = dayWidth / 24;
      const showMinutes = zoomLevel >= 2.5;
      
      return (
        <div style={{ width: ganttWidth, position: 'relative', height: showMinutes ? 90 : 60 }}>
          {/* Day header */}
          <div className="flex border-b border-border-default bg-background-secondary h-8">
            {days.map((day, idx) => (
              <div 
                key={idx}
                style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                className={`border-r border-border-default px-2 text-center font-semibold text-xs flex items-center justify-center ${
                  isToday(day) ? 'bg-red-100 text-red-600' : ''
                }`}
              >
                {format(day, 'MMM d')}
              </div>
            ))}
          </div>
          
          {/* Hour header */}
          <div className="flex border-b border-border-default bg-background-tertiary h-8">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="flex" style={{ width: `${dayWidth}px` }}>
                {Array.from({ length: 24 }, (_, hourIdx) => (
                  <div
                    key={hourIdx}
                    style={{ width: `${hourWidth}px`, minWidth: `${hourWidth}px` }}
                    className="border-r border-border-default text-center text-[10px] flex items-center justify-center"
                  >
                    {/* Show ALL hours at high zoom, every 4 hours at low zoom */}
                    {showMinutes ? `${hourIdx}h` : (hourIdx % 4 === 0 ? `${hourIdx}h` : '')}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Minute header (only at high zoom >= 2.5) */}
          {showMinutes && (
            <div className="flex border-b border-border-default bg-background-tertiary/50 h-8">
              {days.map((day, dayIdx) => (
                <div key={dayIdx} className="flex" style={{ width: `${dayWidth}px` }}>
                  {Array.from({ length: 24 }, (_, hourIdx) => {
                    const minuteWidth = hourWidth / 60;
                    // Show every 10 minutes for better readability
                    return Array.from({ length: 6 }, (_, minIdx) => {
                      const minute = minIdx * 10;
                      return (
                        <div
                          key={`${hourIdx}-${minIdx}`}
                          style={{ width: `${minuteWidth * 10}px`, minWidth: `${minuteWidth * 10}px` }}
                          className="border-r border-border-default/50 text-center text-[9px] flex items-center justify-center text-text-tertiary"
                        >
                          {minute === 0 ? '00' : `${minute}`}
                        </div>
                      );
                    });
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

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
        
        {/* Day header with hours */}
        <div className="flex border-b border-border-default bg-background-tertiary h-8">
          {days.map((day, idx) => (
            <div 
              key={idx}
              style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
              className={`border-r border-border-default text-center text-xs flex flex-col items-center justify-center ${
                isToday(day) ? 'bg-red-100 font-bold text-red-600' : ''
              }`}
            >
              <div className="font-semibold">{format(day, 'd')}</div>
              <div className="text-[10px] opacity-60">8h</div>
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
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .gantt-export-area,
          .gantt-export-area * {
            visibility: visible;
          }
          
          .gantt-export-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          
          /* Hide interactive elements */
          button, input[type="range"], input[type="checkbox"], label {
            display: none !important;
          }
          
          /* Optimize colors for print */
          .bg-blue-500 { background-color: #3b82f6 !important; }
          .bg-green-500 { background-color: #22c55e !important; }
          .bg-red-500 { background-color: #ef4444 !important; }
          .bg-gray-400 { background-color: #9ca3af !important; }
          .bg-purple-500 { background-color: #a855f7 !important; }
          
          /* Clean borders */
          .border-border-default { border-color: #e5e7eb !important; }
          
          /* Page breaks */
          .phase-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
      
      <Toaster position="top-right" />
      
      {/* Tooltip - Improved Visual Design */}
      {tooltip.visible && tooltip.task && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-xl shadow-2xl p-4 pointer-events-none max-w-sm border-2 border-gray-700"
          style={{ 
            left: `${tooltip.x + 15}px`, 
            top: `${tooltip.y + 15}px` 
          }}
        >
          {/* Task Name */}
          <div className="font-bold text-base mb-2 text-blue-400">{tooltip.task.name}</div>
          
          {/* Status Row with Visual Indicator */}
          <div className="flex items-center gap-2 mb-2">
            {tooltip.task.status === 'DONE' && (
              <span className="px-2 py-1 bg-green-600 rounded-md text-xs font-bold">✅ DONE</span>
            )}
            {tooltip.task.status === 'IN_PROGRESS' && (
              <span className="px-2 py-1 bg-blue-600 rounded-md text-xs font-bold animate-pulse">⏳ IN PROGRESS</span>
            )}
            {tooltip.task.status === 'PENDING' && getTaskDependencies(tooltip.task).length === 0 && (
              <span className="px-2 py-1 bg-green-500 rounded-md text-xs font-bold">✅ READY</span>
            )}
            {tooltip.task.status === 'PENDING' && getTaskDependencies(tooltip.task).length > 0 && (
              <span className="px-2 py-1 bg-red-500 rounded-md text-xs font-bold">🚫 BLOCKED</span>
            )}
            
            {tooltip.task.priority && (
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                tooltip.task.priority === 'HIGH' ? 'bg-red-600' :
                tooltip.task.priority === 'MEDIUM' ? 'bg-orange-500' :
                'bg-gray-600'
              }`}>
                {tooltip.task.priority === 'HIGH' ? '🔥' : tooltip.task.priority === 'MEDIUM' ? '⚡' : '📌'} {tooltip.task.priority}
              </span>
            )}
          </div>
          
          {/* Quick Info */}
          <div className="space-y-1 text-xs text-gray-300 mb-2">
            {tooltip.task.estimated_hours && (
              <div className="flex items-center gap-1">⏱️ <span className="text-white font-semibold">{tooltip.task.estimated_hours}h</span></div>
            )}
            {tooltip.task.assigned_to && (
              <div className="flex items-center gap-1">👤 <span className="text-white font-semibold">{tooltip.task.assigned_to}</span></div>
            )}
          </div>
          
          {/* Dependencies Info */}
          {(() => {
            const predecessors = getTaskDependencies(tooltip.task);
            const successors = tasks.filter(t => {
              const deps = getTaskDependencies(t);
              return deps.some(dep => dep.id === tooltip.task.id);
            });
            
            return (
              <>
                {predecessors.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-yellow-400 font-bold mb-1 flex items-center gap-1">
                      ⬅️ Depends on ({predecessors.length}):
                    </div>
                    <div className="space-y-1">
                      {predecessors.slice(0, 3).map(depTask => (
                        <div key={depTask.id} className="ml-2 text-xs flex items-center gap-1">
                          {depTask.status === 'DONE' ? '✅' : depTask.status === 'IN_PROGRESS' ? '⏳' : '⏸️'}
                          <span className="text-white">{depTask.name}</span>
                        </div>
                      ))}
                      {predecessors.length > 3 && (
                        <div className="ml-2 text-xs text-gray-400">+ {predecessors.length - 3} more...</div>
                      )}
                    </div>
                  </div>
                )}
                {successors.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-red-400 font-bold mb-1 flex items-center gap-1">
                      ➡️ Blocks ({successors.length}):
                    </div>
                    <div className="space-y-1">
                      {successors.slice(0, 3).map(task => (
                        <div key={task.id} className="ml-2 text-xs flex items-center gap-1">
                          ⏸️ <span className="text-white">{task.name}</span>
                        </div>
                      ))}
                      {successors.length > 3 && (
                        <div className="ml-2 text-xs text-gray-400">+ {successors.length - 3} more...</div>
                      )}
                    </div>
                  </div>
                )}
                {predecessors.length === 0 && successors.length === 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                    No dependencies
                  </div>
                )}
              </>
            );
          })()}
          
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
            Click for details →
          </div>
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.visible && contextMenu.task && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
          style={{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setSelectedTask(contextMenu.task);
              setContextMenu({ visible: false, task: null, x: 0, y: 0 });
            }}
          >
            <span>📝</span> Edit Task
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              duplicateTask(contextMenu.task);
              setContextMenu({ visible: false, task: null, x: 0, y: 0 });
            }}
          >
            <span>📋</span> Duplicate
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
            onClick={() => {
              if (window.confirm(`Delete task "${contextMenu.task.name}"?`)) {
                deleteTask(contextMenu.task.id);
              }
              setContextMenu({ visible: false, task: null, x: 0, y: 0 });
            }}
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      )}
      
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={loadData}
          allTasks={tasks} 
        />
      )}
      
      {/* Header Controls - Mobile Responsive */}
      <div className="flex-shrink-0 p-3 border-b border-border-default space-y-2">
        {/* Row 1: Title + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h3 className="font-bold text-base sm:text-lg text-text-primary">Gantt</h3>
            <span className="text-xs sm:text-sm text-text-tertiary">
              {sortedTasks.length} tasks
            </span>
          </div>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border-default rounded-md bg-background-primary w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Row 2: Controls - Mobile Optimized */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode - Compact on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1 border border-border-default rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-background-primary hover:bg-background-tertiary'}`}
            >
              Month
            </button>
          </div>
          
          <div className="border-l border-border-default h-6 mx-2"></div>
          
          {/* Filters - Compact on mobile */}
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="bg-background-primary border border-border-default rounded-md px-1.5 sm:px-2 py-1 text-xs sm:text-sm"
            title="Filter by Status"
          >
            <option value="ALL">Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          
          <select 
            value={filterPriority} 
            onChange={e => setFilterPriority(e.target.value)} 
            className="bg-background-primary border border-border-default rounded-md px-1.5 sm:px-2 py-1 text-xs sm:text-sm"
            title="Filter by Priority"
          >
            <option value="ALL">Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          
          {/* Today Button - Compact on mobile */}
          <button 
            onClick={scrollToToday}
            className="px-2 sm:px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium flex items-center gap-1"
            title="Jump to Today"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Today</span>
          </button>
          
          {/* Dependencies Toggle - Essential */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm">
            <input 
              type="checkbox" 
              checked={showDependencies} 
              onChange={() => setShowDependencies(!showDependencies)} 
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="hidden sm:inline">Dependencies</span>
            <span className="sm:hidden">Deps</span>
          </label>
          
          <div className="border-l border-border-default h-6 mx-1 sm:mx-2 hidden sm:block"></div>
          
          {/* Zoom Slider - Simplified */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-text-tertiary hidden sm:inline">Zoom:</span>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              title={`Zoom: ${Math.round(zoomLevel * 100)}%`}
            />
            <span className="text-xs text-text-tertiary w-8 sm:w-10">{Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      </div>
      
      {/* Gantt Chart */}
      <div className="flex-1 flex overflow-hidden relative gantt-export-area">
        {/* Toggle Task Column Button */}
        <button
          onClick={() => setTaskColumnCollapsed(!taskColumnCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-background-secondary border border-border-default rounded-r-md px-1 py-4 hover:bg-background-tertiary transition-all shadow-lg"
          style={{ left: taskColumnCollapsed ? '0' : '400px' }}
          title={taskColumnCollapsed ? 'Show Tasks' : 'Hide Tasks'}
        >
          {taskColumnCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        
        {/* Left Panel - Tasks */}
        {!taskColumnCollapsed && (
          <div 
            ref={leftPanelRef}
            className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-border-default transition-all"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Header */}
            <div className="h-[60px] flex items-center justify-between px-4 sticky top-0 z-20 bg-background-secondary border-b border-border-default">
              <h4 className="font-bold text-text-primary">Tasks</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCollapsedPhases(new Set())}
                  className="text-xs px-2 py-1 rounded hover:bg-background-tertiary"
                  title="Expand All Phases"
                >
                  ⬇️ Expand All
                </button>
                <button
                  onClick={() => setCollapsedPhases(new Set(phases.map(p => p.id)))}
                  className="text-xs px-2 py-1 rounded hover:bg-background-tertiary"
                  title="Collapse All Phases"
                >
                  ⬆️ Collapse All
                </button>
              </div>
            </div>
          
          {/* Task List */}
          <div className="relative">
            {phases.map(phase => (
              <React.Fragment key={phase.id}>
                {/* Phase Header with Collapse */}
                <div 
                  className="h-10 flex items-center gap-2 p-2 sticky top-[60px] z-10 bg-background-tertiary border-b border-t border-border-default cursor-pointer hover:bg-background-secondary"
                  onClick={() => togglePhase(phase.id)}
                >
                  {collapsedPhases.has(phase.id) ? (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                  <strong className="text-sm text-text-primary">{phase.name}</strong>
                  <span className="text-xs text-text-tertiary ml-auto">
                    ({sortedTasks.filter(t => t.phase_id === phase.id).length} tasks)
                  </span>
                </div>
                
                {/* Tasks (only if phase not collapsed) */}
                {!collapsedPhases.has(phase.id) && sortedTasks.filter(t => t.phase_id === phase.id).map(task => {
                  const hasChildren = task.children && task.children.length > 0;
                  const isCollapsed = collapsedTasks.has(task.id);
                  const indentPx = (task.level || 0) * 20; // 20px per level
                  
                  return (
                    <div 
                      key={task.id}
                      data-task-id={task.id}
                      style={{ height: `${rowHeight}px` }}
                      className={`flex items-center justify-between text-sm border-b border-border-default cursor-pointer transition-colors ${
                        highlightedTask?.id === task.id || selectedTask?.id === task.id ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500' :
                        hoveredTask === task.id ? 'bg-blue-50 dark:bg-blue-900/10' :
                        searchQuery && task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
                        'hover:bg-background-tertiary'
                      }`}
                      onClick={() => handleTaskClick(task)}
                      onDoubleClick={() => setSelectedTask(task)}
                      onMouseEnter={(e) => {
                        setHoveredTask(task.id);
                        setTooltip({
                          visible: true,
                          task,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredTask(null);
                        setTooltip({ visible: false, task: null, x: 0, y: 0 });
                      }}
                    >
                      <span 
                        className="truncate pr-2 flex items-center gap-1"
                        style={{ paddingLeft: `${8 + indentPx}px` }}
                      >
                        {/* Expand/Collapse for parent tasks */}
                        {hasChildren ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(task.id);
                            }}
                            className="flex-shrink-0 hover:bg-background-secondary rounded p-0.5"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4"></span>
                        )}
                        
                        {/* Milestone diamond */}
                        {task.is_milestone && <span className="text-yellow-500 text-sm">◆</span>}
                        
                        {/* Task name */}
                        <span className="truncate">{task.name}</span>
                      </span>
                      
                      {/* Status badge */}
                      <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 mr-2 ${
                        task.status === 'DONE' ? 'bg-success-background text-success-text' : 
                        task.status === 'IN_PROGRESS' ? 'bg-info-background text-info-text' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          </div>
        )}
        
        {/* Right Panel - Timeline */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-auto relative"
          style={{ 
            scrollbarWidth: 'thin',
            userSelect: (draggedTask || resizingTask) ? 'none' : 'auto' // Prevent text selection during drag
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Sticky Timeline Headers */}
          <div className="sticky top-0 z-30 bg-background-primary">
            {renderTimelineHeaders()}
          </div>
          
          <div style={{ width: ganttWidth, position: 'relative' }}>
            
            {/* Gantt Bars */}
            <div className="relative" style={{ width: ganttWidth }}>
              {/* Grid Lines (vertical lines for each hour/day/week) */}
              {viewMode === 'hour' && eachDayOfInterval({ start: projectDates.start, end: projectDates.end }).map((day, dayIdx) => {
                // Show grid line every 4 hours
                return Array.from({ length: 6 }, (_, hourIdx) => {
                  const hour = hourIdx * 4;
                  const left = differenceInDays(day, projectDates.start) * dayWidth + (dayWidth / 24) * hour;
                  return (
                    <div 
                      key={`grid-${dayIdx}-${hour}`}
                      className="absolute top-0 bottom-0 w-px bg-gray-200 pointer-events-none"
                      style={{ left: `${left}px` }}
                    />
                  );
                });
              })}
              
              {viewMode === 'week' && eachWeekOfInterval({ start: projectDates.start, end: projectDates.end }, { weekStartsOn: 1 }).map((week, idx) => {
                const weekStart = week;
                const left = differenceInDays(weekStart, projectDates.start) * dayWidth;
                return (
                  <div 
                    key={`grid-${idx}`}
                    className="absolute top-0 bottom-0 w-px bg-gray-200 pointer-events-none"
                    style={{ left: `${left}px` }}
                  />
                );
              })}
              
              {viewMode === 'day' && eachDayOfInterval({ start: projectDates.start, end: projectDates.end }).map((day, idx) => {
                const left = differenceInDays(day, projectDates.start) * dayWidth;
                return (
                  <div 
                    key={`grid-${idx}`}
                    className="absolute top-0 bottom-0 w-px bg-gray-200 pointer-events-none"
                    style={{ left: `${left}px` }}
                  />
                );
              })}
              
              {/* Today Marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                style={{ left: `${todayPosition}px` }}
              >
                <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  Today
                </div>
              </div>
              
              {/* Dependency Arrows */}
              {renderDependencyArrows()}
              
              {/* Task Bars */}
              {phases.map(phase => {
                const phaseTasks = sortedTasks.filter(t => t.phase_id === phase.id);
                return (
                <React.Fragment key={`phase-bars-${phase.id}`}>
                  {/* Phase header row */}
                  <div className="h-10 bg-background-tertiary/30 border-b border-t border-border-default"></div>
                  
                  {/* Task rows */}
                  {!collapsedPhases.has(phase.id) && phaseTasks.map((task) => {
                    // Use updated position if this task is being dragged/resized
                    const displayTask = 
                      draggedTask?.id === task.id ? draggedTask :
                      resizingTask?.id === task.id ? resizingTask :
                      task;
                    
                    const { left, width } = getTaskPosition(displayTask);
                    const progress = task.progress_percentage || 0;
                    
                    // Calculate bar height based on row height
                    const barHeight = Math.max(rowHeight - 10, 20); // Leave 10px padding, min 20px
                    const barTop = (rowHeight - barHeight) / 2; // Center vertically
                    
                    return (
                      <div 
                        key={`bar-${task.id}`} 
                        className="relative border-b border-border-default" 
                        style={{ height: `${rowHeight}px` }}>
                        {task.is_milestone ? (
                          // Milestone Diamond
                          <div
                            style={{ left: `${left}px`, top: `${barTop}px` }}
                            className={`absolute w-6 h-6 bg-yellow-400 border-2 border-yellow-600 transform rotate-45 cursor-pointer ${
                              draggedTask?.id === task.id ? '' : 'transition-all'
                            } z-10 ${
                              highlightedTask?.id === task.id || selectedTask?.id === task.id ? 'scale-125 ring-4 ring-blue-400' :
                              hoveredTask === task.id ? 'scale-110 ring-2 ring-blue-300' :
                              'hover:scale-110'
                            }`}
                            onClick={(e) => handleBarClick(task, e)}
                            onContextMenu={(e) => handleBarRightClick(task, e)}
                            onMouseEnter={() => setHoveredTask(task.id)}
                            onMouseLeave={() => setHoveredTask(null)}
                            title={task.name}
                          ></div>
                        ) : (
                          // Regular Task Bar
                          <div
                            style={{ left: `${left}px`, width: `${width}px`, top: `${barTop}px`, height: `${barHeight}px` }}
                            className={`absolute rounded-md ${
                              draggedTask?.id === task.id || resizingTask?.id === task.id ? '' : 'transition-all duration-200'
                            } ${
                              draggedTask?.id === task.id || resizingTask?.id === task.id ? 'cursor-grabbing' : 'cursor-grab'
                            } ${
                              calculateCriticalPath.has(task.id) ? 'bg-red-500 ring-2 ring-red-600' :
                              task.status === 'DONE' ? 'bg-green-500' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                              'bg-gray-400'
                            } ${
                              highlightedTask?.id === task.id || selectedTask?.id === task.id ? 'ring-4 ring-blue-400 ring-offset-2 scale-105' :
                              draggedTask?.id === task.id || resizingTask?.id === task.id ? 'opacity-70 ring-4 ring-yellow-400' : 
                              hoveredTask === task.id ? 'ring-2 ring-blue-300' :
                              'hover:opacity-80'
                            } shadow-md group`}
                            onMouseDown={(e) => handleBarMouseDown(e, task)}
                            onClick={(e) => handleBarClick(task, e)}
                            onContextMenu={(e) => handleBarRightClick(task, e)}
                            onMouseEnter={(e) => {
                              // Only show tooltip if not dragging
                              if (!draggedTask && !resizingTask) {
                                setHoveredTask(task.id);
                                setTooltip({
                                  visible: true,
                                  task,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              if (!draggedTask && !resizingTask) {
                                setHoveredTask(null);
                                setTooltip({ visible: false, task: null, x: 0, y: 0 });
                              }
                            }}
                            onMouseMove={(e) => {
                              // Update tooltip position only if not dragging
                              if (!draggedTask && !resizingTask && tooltip.visible && tooltip.task?.id === task.id) {
                                setTooltip({
                                  visible: true,
                                  task,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }
                            }}
                          >
                            {/* Baseline (if enabled) */}
                            {showBaseline && task.baseline_start_date && task.baseline_end_date && (
                              <div
                                className="absolute -top-1 left-0 h-1 bg-gray-300 rounded-full opacity-50"
                                style={{
                                  width: `${differenceInDays(new Date(task.baseline_end_date), new Date(task.baseline_start_date)) * dayWidth}px`,
                                  left: `${differenceInDays(new Date(task.baseline_start_date), new Date(task.start_date || task.started_at)) * dayWidth}px`
                                }}
                              ></div>
                            )}
                            
                            {/* Resize Handles - Wider for easier grab */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-white/30 transition-all z-20"
                              onMouseDown={(e) => {
                                e.stopPropagation(); // Prevent bar drag
                                handleBarMouseDown(e, task, 'left');
                              }}
                              title="◀ Drag to change start date"
                            >
                              <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/80 rounded-full shadow"></div>
                            </div>
                            <div 
                              className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-white/30 transition-all z-20"
                              onMouseDown={(e) => {
                                e.stopPropagation(); // Prevent bar drag
                                handleBarMouseDown(e, task, 'right');
                              }}
                              title="Drag to change end date ▶"
                            >
                              <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/80 rounded-full shadow"></div>
                            </div>
                            
                            {/* Progress Bar */}
                            {progress > 0 && (
                              <div 
                                className="absolute top-0 left-0 bottom-0 bg-black/20 rounded-l-md"
                                style={{ width: `${progress}%` }}
                              ></div>
                            )}
                            
                            {/* Task Name + Status Badge + Dependencies */}
                            <div className="absolute inset-0 flex items-center px-2 text-white font-semibold truncate pointer-events-none gap-1">
                              {/* Status Badge */}
                              {task.status === 'DONE' && (
                                <span className="px-1.5 py-0.5 bg-green-600 rounded text-[10px] font-bold">✓</span>
                              )}
                              {task.status === 'IN_PROGRESS' && (
                                <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[10px] font-bold animate-pulse">⏳</span>
                              )}
                              {task.status === 'PENDING' && getTaskDependencies(task).length === 0 && (
                                <span className="px-1.5 py-0.5 bg-green-500 rounded text-[10px] font-bold">✓</span>
                              )}
                              {task.status === 'PENDING' && getTaskDependencies(task).length > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-500 rounded text-[10px] font-bold">🚫</span>
                              )}
                              
                              {/* Dependency Count Badges */}
                              {(() => {
                                const depCount = getTaskDependencies(task).length;
                                const blockCount = tasks.filter(t => {
                                  const deps = getTaskDependencies(t);
                                  return deps.some(dep => dep.id === task.id);
                                }).length;
                                
                                return (
                                  <>
                                    {depCount > 0 && (
                                      <span className="px-1.5 py-0.5 bg-yellow-500/90 rounded text-[10px] font-bold" title={`Depends on ${depCount} task(s)`}>
                                        ⬅️{depCount}
                                      </span>
                                    )}
                                    {blockCount > 0 && (
                                      <span className="px-1.5 py-0.5 bg-red-500/90 rounded text-[10px] font-bold" title={`Blocks ${blockCount} task(s)`}>
                                        ➡️{blockCount}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                              
                              <span className="truncate text-xs">{task.name}</span>
                              {task.assigned_to && width > 120 && (
                                <span className="ml-auto text-xs opacity-90 flex-shrink-0">@{task.assigned_to.split('@')[0]}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
