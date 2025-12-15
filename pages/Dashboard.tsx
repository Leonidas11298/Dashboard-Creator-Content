import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, MessageCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../src/lib/supabase';

// Helper to format currency
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

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

const Dashboard = ({ onQuickAdd, currentUserId, currentUserRole }: { onQuickAdd: () => void, currentUserId: string | null, currentUserRole: string | null }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    unreadMessages: 0,
    totalViews: 0
  });

  // Social Stats State
  const [socialMetrics, setSocialMetrics] = useState<any[]>([]);
  const [activePlatformIndex, setActivePlatformIndex] = useState(0);

  const handleTaskComplete = async (id: string) => {
    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== id));

      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Tasks (Only incomplete)
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('is_completed', false)
          .order('due_date', { ascending: true })
          .limit(5);

        if (tasksError) console.error('Error fetching tasks:', tasksError);
        else setTasks(tasksData || []);

        // Fetch Revenue Data
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue_daily')
          .select('*')
          .order('date', { ascending: true })
          .limit(30);

        if (revenueError) console.error('Error fetching revenue:', revenueError);

        if (revenueData && revenueData.length > 0) {
          setChartData(revenueData.map(d => ({ name: new Date(d.date).getDate().toString(), uv: Number(d.amount) })));

          // Calculate Daily Revenue (assuming last entry is today)
          const today = revenueData[revenueData.length - 1];
          setStats(prev => ({ ...prev, revenue: Number(today.amount) }));
        } else {
          setChartData([]);
          setStats(prev => ({ ...prev, revenue: 0 }));
        }

        // Fetch Unread Messages
        if (currentUserId) {
          const { data: msgs, error: msgError } = await supabase
            .from('team_messages')
            .select('*')
            .eq('receiver_id', currentUserId);

          if (msgError) console.error('Error fetching messages:', msgError);
          else {
            // Client-side filter for 'is_read' to be safe if schema update failed
            const unreadCount = msgs.filter((m: any) => m.is_read === false || m.is_read === undefined).length;
            setStats(prev => ({ ...prev, unreadMessages: unreadCount }));
          }
        }

        // Fetch Social Metrics (Latest per platform)
        const { data: metricsData, error: metricsError } = await supabase
          .from('platform_metrics')
          .select('*')
          .order('date', { ascending: false })
          .limit(50); // Fetch enough to find latest for each

        if (metricsData) {
          const latestMap = new Map();
          metricsData.forEach((m: any) => {
            if (!latestMap.has(m.platform)) {
              latestMap.set(m.platform, m);
            }
          });
          const latestMetrics = Array.from(latestMap.values());
          setSocialMetrics(latestMetrics);
          const totalV = latestMetrics.reduce((sum, m) => sum + m.views, 0);
          setStats(prev => ({ ...prev, totalViews: totalV }));
        }

      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Social Carousel Helpers
  const nextPlatform = () => {
    setSocialMetrics(prev => {
      if (prev.length === 0) return prev;
      setActivePlatformIndex(curr => (curr + 1) % prev.length);
      return prev;
    });
  };

  const currentPlatformMetric = socialMetrics[activePlatformIndex];

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Good Morning, {currentUserRole === 'admin' ? 'Boss' : 'Partner'}.</h2>
        <p className="text-slate-400 mt-1">Here is what's happening in your empire today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Daily Revenue"
          value={formatCurrency(stats.revenue)}
          sub={stats.revenue === 0 ? "No data yet" : "From latest entry"}
          icon={TrendingUp}
          colorClass="text-green-500"
        />

        {/* Messages Card (Dynamic) */}
        <StatCard
          title="Unread DMs"
          value={stats.unreadMessages.toString()}
          sub={stats.unreadMessages > 0 ? "Action required" : "All caught up"}
          icon={MessageCircle}
          colorClass={stats.unreadMessages > 0 ? "text-purple-400 animate-pulse" : "text-slate-500"}
        />

        {/* Social Views Card (Carousel) */}
        <div
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all cursor-pointer"
          onClick={nextPlatform}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
            <Users size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-slate-800 bg-opacity-50">
                <Users size={20} className="text-blue-500" />
              </div>
              <span className="text-slate-400 font-medium text-sm">Social Impact</span>
            </div>

            {socialMetrics.length > 0 ? (
              <div className="animate-fade-in select-none">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {currentPlatformMetric?.views.toLocaleString() || 0}
                </h3>
                <p className="text-sm text-blue-400 font-medium mt-1 uppercase flex items-center justify-between">
                  <span>{currentPlatformMetric?.platform} Views</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Tap to cycle</span>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">0</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">No data logged</p>
              </div>
            )}

            {/* Dots indicator */}
            {socialMetrics.length > 1 && (
              <div className="flex gap-1 mt-3">
                {socialMetrics.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === activePlatformIndex ? 'w-4 bg-blue-500' : 'w-1 bg-slate-700'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
            {tasks.length === 0 && !loading && (
              <p className="text-slate-500 text-sm">No pending tasks.</p>
            )}
            {tasks.map((task, i) => (
              <div key={task.id || i} className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-green-500 focus:ring-green-500 cursor-pointer"
                    onChange={() => handleTaskComplete(task.id)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200 group-hover:text-white transition-colors">{task.text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <div className={`mt-1 w-2 h-2 rounded-full ${task.type === 'high' ? 'bg-red-500' : task.type === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
              </div>
            ))}
          </div>
          <button
            onClick={onQuickAdd}
            className="w-full mt-4 py-2 border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm hover:text-white hover:border-slate-500 transition-colors"
          >
            + Add Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
