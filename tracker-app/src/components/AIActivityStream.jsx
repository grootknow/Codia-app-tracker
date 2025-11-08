import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, CheckCircle, Clock, AlertCircle, Zap, Play } from 'lucide-react';

export const AIActivityStream = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    
    // Real-time subscription
    const subscription = supabase
      .channel('ai_activity')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_execution_logs' },
        () => loadLogs()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_execution_logs')
        .select(`
          *,
          tasks(name, phase_id)
        `)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading AI logs:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      started: <Clock className="w-4 h-4 text-blue-500" />,
      progress: <Activity className="w-4 h-4 text-yellow-500" />,
      completed: <CheckCircle className="w-4 h-4 text-green-500" />,
      failed: <AlertCircle className="w-4 h-4 text-red-500" />
    };
    return icons[status] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading AI activity...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">🤖 Cascade Activity Stream</h2>
        <span className="ml-auto text-sm text-gray-500">Real-time updates</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No activity yet. Cascade will log here when working.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div 
              key={log.id} 
              className="flex gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex-shrink-0">
                {log.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : log.status === 'started' ? (
                  <Play className="w-6 h-6 text-blue-500 animate-pulse" />
                ) : log.status === 'progress' ? (
                  <Activity className="w-6 h-6 text-purple-500 animate-spin" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-gray-900 truncate flex items-center gap-2">
                    🤖 {log.agent_name}
                    {log.task_id && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        Task #{log.task_id}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{log.action}</p>
                {log.current_step && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 px-3 py-2 mt-2">
                    <p className="text-xs text-blue-700 font-medium">
                      ⚡ {log.current_step}
                    </p>
                  </div>
                )}
                {log.progress_percentage !== null && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                      <span>Progress</span>
                      <span className="text-blue-600">{log.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          log.progress_percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${log.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                {log.status === 'completed' && (
                  <div className="mt-2">
                    <div className="text-xs text-green-600 font-semibold">
                      ✅ Task completed successfully
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
