import React, { useState } from 'react';
import { TasksView } from './components/TasksView';
import { GapDashboard } from './components/GapDashboard';
import { SetupWizard } from './components/SetupWizard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('tasks'); // Default to tasks (which has Gantt view)
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (config) => {
    setShowWizard(false);
    console.log('Setup config:', config);
  };

  if (showWizard) {
    return <SetupWizard onComplete={handleWizardComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-blue-600">🚀 CODIA PLATFORM TRACKER</h1>
            <p className="text-gray-600 mt-2">Real-time progress tracking for infrastructure + AI capabilities</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition"
          >
            ✨ Setup Wizard
          </button>
        </div>
      </header>

      {/* Navigation */}
        <nav className="bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-3 text-base font-bold transition rounded-lg ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Tasks
              </button>
              <button
                onClick={() => setActiveTab('gap')}
                className={`px-6 py-3 text-base font-bold transition rounded-lg ${
                  activeTab === 'gap'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Analytics
              </button>
            </div>
          </div>
        </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6 h-[calc(100vh-80px)]">
        {activeTab === 'tasks' && (
          <div className="h-full">
            <TasksView />
          </div>
        )}

        {activeTab === 'gap' && (
          <div>
            <GapDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>CODIA Platform Tracker • Real-time • Powered by Supabase</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
