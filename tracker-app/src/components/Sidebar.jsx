import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, BarChart2, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const NavItem = ({ icon: Icon, label, isActive, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? 'bg-brand-primary text-white shadow-lg'
        : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
    } ${collapsed ? 'justify-center' : ''}`}
    title={collapsed ? label : ''}
  >
    <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

export const Sidebar = ({ activePage, setActivePage }) => {
  const [collapsed, setCollapsed] = useState(() => 
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed.toString());
  }, [collapsed]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className={`bg-background-secondary p-4 flex flex-col border-r border-border-default transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-3 mb-6 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-10 h-10 bg-brand-primary rounded-xl flex-shrink-0">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight text-text-primary truncate">CODIA TRACKER</h1>
            <p className="text-xs text-text-tertiary truncate">V10 Infrastructure</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-4 p-2 rounded-lg hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors self-center"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activePage === item.id}
            onClick={() => setActivePage(item.id)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer/User Info (Placeholder) */}
      <div className="mt-auto">
        {/* User profile can go here */}
      </div>
    </div>
  );
};
