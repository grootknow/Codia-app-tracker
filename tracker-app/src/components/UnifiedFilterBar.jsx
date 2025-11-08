import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export const UnifiedFilterBar = ({
  searchQuery = '',
  onSearchChange,
  filterPhase = 'all',
  onPhaseChange,
  filterPriority = 'all',
  onPriorityChange,
  filterStatus = 'all',
  onStatusChange,
  phases = [],
  showClearButton = false,
  onClearFilters,
  resultCount,
  totalCount
}) => {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        <Filter className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex gap-3 items-center">
        <select
          value={filterPhase}
          onChange={(e) => onPhaseChange?.(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Phases</option>
          {phases.map(phase => (
            <option key={phase.id} value={phase.id}>
              Phase {phase.id}: {phase.name}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => onPriorityChange?.(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="HIGH">🔥 High</option>
          <option value="MEDIUM">⚡ Medium</option>
          <option value="LOW">📌 Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="PENDING">⏸️ Pending</option>
          <option value="IN_PROGRESS">▶️ In Progress</option>
          <option value="DONE">✅ Done</option>
          <option value="BLOCKED">🔒 Blocked</option>
        </select>
        {showClearButton && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
        {resultCount !== undefined && totalCount !== undefined && (
          <div className="ml-auto text-sm text-gray-600">
            Showing <span className="font-bold text-gray-800">{resultCount}</span> of{' '}
            <span className="font-bold">{totalCount}</span> tasks
          </div>
        )}
      </div>
    </div>
  );
};
