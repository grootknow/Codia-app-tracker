import React from 'react';
import { CheckCircle, Clock, FileText, Terminal, Lightbulb, TrendingUp } from 'lucide-react';

export const TaskCompletionReport = ({ task }) => {
  if (!task || task.status !== 'DONE') return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Completion Report */}
      {task.completion_report && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 text-lg">
            <CheckCircle className="w-6 h-6" />
            📊 Completion Report
          </h3>
          <div className="whitespace-pre-wrap text-gray-700 space-y-2">
            {task.completion_report.split('\n').map((line, idx) => (
              <p key={idx} className={line.startsWith('✅') || line.startsWith('📋') || line.startsWith('⏱') || line.startsWith('📝') ? 'font-semibold mt-3' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Lessons Learned */}
      {task.lessons_learned && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-700 mb-3 flex items-center gap-2 text-lg">
            <Lightbulb className="w-6 h-6" />
            💡 Lessons Learned
          </h3>
          <p className="text-gray-700">{task.lessons_learned}</p>
          <div className="mt-3 text-sm text-yellow-600 italic">
            💾 This knowledge will be used for future tasks
          </div>
        </div>
      )}

      {/* Execution Logs */}
      {task.execution_logs && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2 text-lg">
            <TrendingUp className="w-6 h-6" />
            🔍 Execution Details
          </h3>
          
          {/* Steps */}
          {task.execution_logs.steps && task.execution_logs.steps.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Steps Executed:
              </h4>
              <div className="space-y-2">
                {task.execution_logs.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-700">{step.step}</span>
                      {step.timestamp && (
                        <span className="text-gray-500 ml-2">
                          ({new Date(step.timestamp).toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Created */}
          {task.execution_logs.files_created && task.execution_logs.files_created.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Files Created:
              </h4>
              <ul className="space-y-1">
                {task.execution_logs.files_created.map((file, idx) => (
                  <li key={idx} className="text-sm text-gray-700 font-mono bg-white px-3 py-1 rounded border border-blue-100">
                    📄 {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Commands Run */}
          {task.execution_logs.commands_run && task.execution_logs.commands_run.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Terminal className="w-4 h-4" />
                Commands Executed:
              </h4>
              <div className="space-y-1">
                {task.execution_logs.commands_run.map((cmd, idx) => (
                  <code key={idx} className="block text-sm text-gray-700 bg-gray-800 text-green-400 px-3 py-2 rounded font-mono">
                    $ {cmd}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time Stats */}
      {task.actual_hours && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">Time Spent:</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {task.actual_hours}h
          </span>
        </div>
      )}
    </div>
  );
};
