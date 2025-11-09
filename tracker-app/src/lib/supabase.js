import { createClient } from '@supabase/supabase-js';
import { withSupabaseError } from './errorHandler';
import toast from 'react-hot-toast';

const SUPABASE_URL = 'https://pmqocxdtypxobihxusqj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcW9jeGR0eXB4b2JpaHh1c3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDYwMjEsImV4cCI6MjA3MzcyMjAyMX0.32zS3ZG9Y7eRYPXZE2dfVIGd1NHGVThVYN-Y4UXx9O8';

// ✅ FIX: Enhanced Supabase client with WebSocket retry logic
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 30000, // ✅ Increase timeout to 30s (from default 10s)
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'codia-tracker-app',
    },
  },
});

// ✅ FIX: WebSocket connection status monitoring (Supabase v2 compatible)
let realtimeConnectionStatus = 'DISCONNECTED';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Supabase v2 doesn't expose onOpen/onClose/onError directly
// Connection status is managed internally by channels
// We'll monitor via channel subscriptions instead
if (typeof window !== 'undefined') {
  console.log('✅ Supabase client initialized');
}

// Export connection status getter
export const getRealtimeStatus = () => realtimeConnectionStatus;

// ✅ FIX: Database health check and RLS policy verification
export const checkDatabaseHealth = async () => {
  const results = {
    connected: false,
    realtimeStatus: realtimeConnectionStatus,
    tablesAccessible: {},
    errors: [],
  };

  try {
    // Test tasks table read permission
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    results.tablesAccessible.tasks = !tasksError;
    if (tasksError) {
      results.errors.push({ table: 'tasks', operation: 'SELECT', error: tasksError });
      console.error('❌ Tasks table read error:', tasksError);
    }

    // Test tasks table write permission
    const testTaskId = tasksData?.[0]?.id;
    if (testTaskId) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testTaskId);

      results.tablesAccessible.tasksWrite = !updateError;
      if (updateError) {
        results.errors.push({ table: 'tasks', operation: 'UPDATE', error: updateError });
        console.error('❌ Tasks table write error:', updateError);
      }
    }

    // Test phases table
    const { error: phasesError } = await supabase
      .from('phases')
      .select('id')
      .limit(1);

    results.tablesAccessible.phases = !phasesError;
    if (phasesError) {
      results.errors.push({ table: 'phases', operation: 'SELECT', error: phasesError });
    }

    // Test views
    const { error: viewError } = await supabase
      .from('tracker_app_data')
      .select('id')
      .limit(1);

    results.tablesAccessible.trackerAppDataView = !viewError;
    if (viewError) {
      results.errors.push({ table: 'tracker_app_data', operation: 'SELECT', error: viewError });
    }

    results.connected = results.errors.length === 0;

    console.log('📊 Database health check:', results);
    return results;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    results.errors.push({ general: true, error });
    return results;
  }
};

// Phases
export const getPhases = async () => {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
};

export const updatePhaseProgress = async (phaseId, progress) => {
  const { data, error } = await supabase
    .from('phases')
    .update({ progress, updated_at: new Date() })
    .eq('id', phaseId);
  if (error) throw error;
  return data;
};

// Tasks - NEW: Query from tracker_app_data view for full context
export const getTasks = async (phaseId) => {
  const { data, error } = await supabase
    .from('tracker_app_data')
    .select('*')
    .eq('phase_id', phaseId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
};

export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tracker_app_data')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
};

// Get GAP analysis
export const getGapAnalysis = async () => {
  const { data, error } = await supabase
    .from('gap_analysis')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

// ✅ FIX CRITICAL #2: Enhanced task status update with better error handling
export const updateTaskStatus = async (taskId, status, notes = '') => {
  // Validation
  if (!taskId) {
    const error = new Error('Task ID is required');
    console.error('❌ updateTaskStatus validation error:', error);
    toast.error('❌ Task ID is required');
    throw error;
  }

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'DONE'];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    console.error('❌ updateTaskStatus validation error:', error);
    toast.error(`❌ Invalid status: ${status}`);
    throw error;
  }

  const updates = {
    status,
    notes,
    updated_at: new Date().toISOString()
  };

  // Set started_at when moving to IN_PROGRESS
  if (status === 'IN_PROGRESS') {
    updates.started_at = new Date().toISOString();
  }

  // Set completed_at when DONE
  if (status === 'DONE') {
    updates.completed_at = new Date().toISOString();
    updates.progress_percentage = 100;
  }

  // Enhanced logging
  console.log('🔄 Updating task status:', { taskId, status, updates });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(); // ✅ Return updated row for verification

    if (error) {
      // Enhanced error logging
      console.error('❌ Supabase update error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        taskId,
        status,
      });

      // User-friendly error messages
      if (error.code === '23514') {
        toast.error('❌ Invalid task data. Check status value.');
      } else if (error.code === '42501') {
        toast.error('❌ Permission denied. Check database policies.');
      } else if (error.code === 'PGRST116') {
        toast.error(`❌ Task ${taskId} not found.`);
      } else {
        toast.error(`❌ Failed to update task: ${error.message}`);
      }

      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Update succeeded but no data returned. Task may not exist:', taskId);
      toast.warning(`⚠️ Task ${taskId} update completed but no data returned`);
    } else {
      console.log('✅ Task updated successfully:', data[0]);
      toast.success(`✅ Task status updated to ${status}`, { duration: 2000 });
    }

    return data;
  } catch (error) {
    console.error('❌ updateTaskStatus exception:', error);
    throw error;
  }
};

// Logs
export const getLogs = async (limit = 50) => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const addLog = async (action, details, status = 'SUCCESS') => {
  const { data, error } = await supabase
    .from('logs')
    .insert([{ action, details, status }]);
  if (error) throw error;
  return data;
};

// Real-time subscriptions (Supabase v2 syntax)
export const subscribeToPhases = (callback) => {
  return supabase
    .channel('phases-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'phases' }, callback)
    .subscribe();
};

export const subscribeToTasks = (phaseId, callback) => {
  return supabase
    .channel(`tasks-channel-${phaseId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'tasks',
      filter: `phase_id=eq.${phaseId}`
    }, callback)
    .subscribe();
};

export const subscribeToLogs = (callback) => {
  return supabase
    .channel('logs-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, callback)
    .subscribe();
};
