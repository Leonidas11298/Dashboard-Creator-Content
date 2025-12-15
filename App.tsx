import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import QuickAddModal from './components/QuickAddModal';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Finance from './pages/Finance';
import Social from './pages/Social';
import Vault from './pages/Vault';
import Contacts from './pages/Contacts';
import { NavigationItem } from './types';

function App() {
  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open Quick Add
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickAddOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard key={refreshKey} onQuickAdd={() => setIsQuickAddOpen(true)} />;
      case 'inbox':
        return <Inbox />;
      case 'finance':
        return <Finance />;
      case 'social':
        return <Social />;
      case 'vault':
        return <Vault />;
      case 'contacts':
        return <Contacts />;
      default:
        return <Dashboard key={refreshKey} onQuickAdd={() => setIsQuickAddOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onQuickAdd={() => setIsQuickAddOpen(true)} />
        <main className="flex-1 relative overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
