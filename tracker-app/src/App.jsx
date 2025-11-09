import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { GapDashboard } from './components/GapDashboard';
import { AIActivityStream } from './components/AIActivityStream';
import './App.css';

function App() {
  // Remember last visited page and support browser back/forward
  const [activePage, setActivePage] = useState(() => {
    // Check URL hash first, then localStorage
    const hash = window.location.hash.slice(1); // Remove #
    if (hash && ['dashboard', 'tasks', 'analytics', 'activity'].includes(hash)) {
      return hash;
    }
    return localStorage.getItem('lastActivePage') || 'dashboard';
  });

  // Save to localStorage and update URL whenever page changes
  useEffect(() => {
    localStorage.setItem('lastActivePage', activePage);
    // Update URL hash without reload
    window.history.pushState(null, '', `#${activePage}`);
  }, [activePage]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['dashboard', 'tasks', 'analytics', 'activity'].includes(hash)) {
        setActivePage(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} />;
      case 'tasks':
        return <TasksPage />;
      case 'analytics':
        return <GapDashboard />;
      case 'activity':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Logs</h1>
            <p className="text-text-secondary mb-6">Real-time AI agent execution logs and task activity</p>
            <AIActivityStream />
          </div>
        );
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="h-screen flex bg-background-primary text-text-secondary">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
