import React from 'react';
import { Bell, Search, Zap, Wifi } from 'lucide-react';

interface TopBarProps {
  onQuickAdd: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onQuickAdd }) => {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: XP Bar & Level */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Level 42</span>
          <div className="w-48 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent w-[75%]" />
          </div>
        </div>
        <span className="text-xs text-slate-500">750 / 1000 XP</span>
      </div>

      {/* Center: System Status */}
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-green-500 rounded-full absolute top-0 left-0 animate-ping opacity-75" />
        </div>
        <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">n8n Scrapers Online</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 w-1/3 justify-end">
        <button 
          onClick={onQuickAdd}
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-lg shadow-green-900/20 transition-all active:scale-95"
          title="Press Cmd+K"
        >
          <Zap size={16} fill="currentColor" />
          <span>Quick Add $</span>
        </button>

        <div className="h-8 w-[1px] bg-slate-800 mx-2" />

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-slate-900" />
        </button>

        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
           <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
