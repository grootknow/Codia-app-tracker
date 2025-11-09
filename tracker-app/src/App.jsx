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

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Sidebar - hidden on mobile by default, shown on tablet+ */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar activePage={activePage} setActivePage={(page) => {
          setActivePage(page);
          setMobileMenuOpen(false); // Close menu on mobile after selection
        }} />
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header with menu button */}
        <div className="md:hidden sticky top-0 z-30 bg-background-secondary border-b border-border-default p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-background-tertiary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-text-primary">CODIA TRACKER</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
        
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
