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
import Settings from './pages/Settings';
import Login from './pages/Login';
import { NavigationItem } from './types';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<NavigationItem>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Profile State
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role, name')
        .eq('user_id', userId)
        .single();

      if (data) {
        setCurrentUserRole(data.role);
        // Get first name only
        const firstName = data.name ? data.name.split(' ')[0] : 'Partner';
        setCurrentUserName(firstName);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth & Profile Listener
  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setCurrentUserRole(null);
        setCurrentUserName(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUserRole(null);
  };

  // HOTKEYS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        return (
          <Dashboard
            key={refreshKey}
            onQuickAdd={() => setIsQuickAddOpen(true)}
            currentUserId={session?.user.id || null}
            currentUserRole={currentUserRole}
            currentUserName={currentUserName}
          />
        );
      case 'inbox':
        return <Inbox currentUserId={session?.user.id || null} currentUserRole={currentUserRole} />;
      case 'finance':
        return <Finance />;
      case 'social':
        return <Social />;
      case 'vault':
        return <Vault />;
      case 'contacts':
        return <Contacts currentUserRole={currentUserRole} />;
      case 'settings':
        return <Settings currentUserId={session?.user.id || null} />;
      default:
        return (
          <Dashboard
            key={refreshKey}
            onQuickAdd={() => setIsQuickAddOpen(true)}
            currentUserId={session?.user.id || null}
            currentUserRole={currentUserRole}
            currentUserName={currentUserName}
          />
        );
    }
  };

  if (loading) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading HQ...</div>;
  }

  if (!session) {
    return <Login />;
  }

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
        currentUserRole={currentUserRole}
        onLogout={handleLogout}
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
