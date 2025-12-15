import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Share2,
  Database,
  Users,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { NavigationItem } from '../types';

interface SidebarProps {
  currentView: NavigationItem;
  onChangeView: (view: NavigationItem) => void;
  currentUserRole?: string | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUserRole, onLogout }) => {
  const allMenuItems: { id: NavigationItem; label: string; icon: React.ReactNode; roles?: string[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inbox', label: 'Team HQ', icon: <MessageSquare size={20} /> }, // Pivot name
    { id: 'contacts', label: 'Contacts', icon: <Users size={20} />, roles: ['admin', 'manager'] },
    { id: 'finance', label: 'Finance', icon: <Wallet size={20} />, roles: ['admin'] },
    { id: 'social', label: 'Social', icon: <Share2 size={20} />, roles: ['admin', 'manager', 'editor'] },
    { id: 'vault', label: 'Vault', icon: <Database size={20} />, roles: ['admin', 'manager', 'editor'] },
  ];

  // Filter items based on role (default to showing nothing or basic if role is missing/loading)
  // If role is undefined (loading), maybe show minimal or nothing. 
  // If role is null (not logged in?), we shouldn't be here.
  // We'll treat 'undefined' as 'guest' for now, but App should handle that.
  const visibleItems = allMenuItems.filter(item => {
    if (!currentUserRole) return true; // Fallback or show all? Better show safe defaults.
    if (!item.roles) return true; // Visible to all
    return item.roles.includes(currentUserRole);
  });

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300">
      <div>
        {/* Branding */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            <Zap size={18} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">IAmigo Creators</h1>
        </div>

        {/* Main Menu */}
        <nav className="px-3 space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onChangeView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'settings' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
