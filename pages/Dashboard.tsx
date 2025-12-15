import React from 'react';
import { TrendingUp, Users, MessageCircle, AlertCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: '1', uv: 400 },
  { name: '5', uv: 1300 },
  { name: '10', uv: 900 },
  { name: '15', uv: 2100 },
  { name: '20', uv: 1800 },
  { name: '25', uv: 3200 },
  { name: '30', uv: 3800 },
];

const StatCard = ({ title, value, sub, icon: Icon, colorClass }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg bg-slate-800 ${colorClass.replace('text-', 'text-').replace('bg-', 'bg-opacity-10 ')}`}>
            <Icon size={20} className={colorClass} />
        </div>
        <span className="text-slate-400 font-medium text-sm">{title}</span>
      </div>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      <p className="text-sm text-green-400 font-medium mt-1 flex items-center gap-1">
        <TrendingUp size={12} />
        {sub}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Good Morning, Creator.</h2>
        <p className="text-slate-400 mt-1">Here is what's happening in your empire today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Daily Revenue" 
          value="$1,240.50" 
          sub="+12% from yesterday" 
          icon={TrendingUp} 
          colorClass="text-green-500" 
        />
        <StatCard 
          title="Pending Messages" 
          value="48" 
          sub="3 Whales waiting" 
          icon={MessageCircle} 
          colorClass="text-purple-500" 
        />
        <StatCard 
          title="New Fans" 
          value="+125" 
          sub="2.4% Conversion Rate" 
          icon={Users} 
          colorClass="text-blue-500" 
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Cash Flow (30 Days)</h3>
            <select className="bg-slate-950 border border-slate-700 rounded-lg text-sm px-3 py-1 text-slate-300 focus:outline-none">
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="uv" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks & Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Urgent Tasks</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {[
                    { text: "Renew custom video for @whale_steve", type: "high", time: "1h left" },
                    { text: "Post daily TikTok teaser", type: "medium", time: "3h left" },
                    { text: "Reply to 5 tip messages", type: "medium", time: "Today" },
                    { text: "Update Linktree bio", type: "low", time: "Tomorrow" },
                ].map((task, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div className={`mt-1 w-2 h-2 rounded-full ${task.type === 'high' ? 'bg-red-500' : task.type === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                            <p className="text-sm text-slate-200 group-hover:text-white transition-colors">{task.text}</p>
                            <p className="text-xs text-slate-500 mt-1">{task.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm hover:text-white hover:border-slate-500 transition-colors">
                + Add Reminder
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
