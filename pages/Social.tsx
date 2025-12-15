import React, { useState, useEffect } from 'react';
import { Share2, Heart, MessageCircle, Eye, BarChart, Plus, GripVertical, Calendar, Type, X, Link as LinkIcon, Activity, Users, DollarSign } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// DB Types
interface Post {
    id: string;
    title: string;
    platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'telegram' | 'other';
    status: 'idea' | 'scripting' | 'filming' | 'editing' | 'ready' | 'posted';
    scheduled_date: string;
    caption: string;
    notes: string;
    reference_url: string;
    hashtags: string[];
}

interface MetricLog {
    id: string;
    date: string;
    platform: string;
    followers: number;
    views: number;
    revenue: number;
}

const COLUMNS = [
    { id: 'idea', label: '💡 Idea' },
    { id: 'scripting', label: '📝 Scripting' },
    { id: 'filming', label: '🎥 Filming' },
    { id: 'editing', label: '✂️ Editing' },
    { id: 'ready', label: '✅ Ready' },
    { id: 'posted', label: '🚀 Posted' }
];

const PLATFORMS = [
    { id: 'tiktok', label: 'TikTok', color: '#F43F5E' },
    { id: 'instagram', label: 'Instagram', color: '#EC4899' },
    { id: 'twitter', label: 'X (Twitter)', color: '#FFFFFF' },
    { id: 'facebook', label: 'Facebook', color: '#3B82F6' },
    { id: 'telegram', label: 'Telegram VIP', color: '#22D3EE' }
] as const;

const Social = () => {
    const [view, setView] = useState<'metrics' | 'planner'>('metrics'); // Default to Metrics as requested for this phase
    const [activeTab, setActiveTab] = useState<typeof PLATFORMS[number]['id']>('tiktok');

    // Planner State
    const [posts, setPosts] = useState<Post[]>([]);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [newIdeaTitle, setNewIdeaTitle] = useState('');
    const [newIdeaNotes, setNewIdeaNotes] = useState('');
    const [newIdeaUrl, setNewIdeaUrl] = useState('');
    const [savingIdea, setSavingIdea] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Metrics State
    const [metricsHistory, setMetricsHistory] = useState<MetricLog[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logFollowers, setLogFollowers] = useState('');
    const [logViews, setLogViews] = useState('');
    const [logRevenue, setLogRevenue] = useState('');

    useEffect(() => {
        if (view === 'planner') fetchPosts();
        if (view === 'metrics') fetchMetrics();
    }, [view, activeTab]);

    const fetchPosts = async () => {
        const { data } = await supabase.from('content_posts').select('*').order('created_at', { ascending: false });
        setPosts(data as Post[] || []);
    };

    const fetchMetrics = async () => {
        // Fetch last 30 days for active platform
        const { data } = await supabase
            .from('platform_metrics')
            .select('*')
            .eq('platform', activeTab)
            .order('date', { ascending: true })
            .limit(30);
        setMetricsHistory(data as MetricLog[] || []);
    };

    const handleLogStats = async (e: React.FormEvent) => {
        e.preventDefault();
        const newLog = {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            platform: activeTab,
            followers: parseInt(logFollowers) || 0,
            views: parseInt(logViews) || 0,
            revenue: parseFloat(logRevenue) || 0
        };

        const { error } = await supabase.from('platform_metrics').upsert(newLog, { onConflict: 'date,platform' });

        if (error) {
            alert('Error saving metrics: ' + error.message);
        } else {
            setIsLogModalOpen(false);
            setLogFollowers('');
            setLogViews('');
            setLogRevenue('');
            fetchMetrics();
        }
    };

    // --- PLANNER HANDLERS ---
    const handleCreateIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIdeaTitle.trim()) return;
        setSavingIdea(true);
        const { data } = await supabase.from('content_posts').insert({
            title: newIdeaTitle, notes: newIdeaNotes, reference_url: newIdeaUrl,
            platform: 'tiktok', status: 'idea'
        }).select().single();
        if (data) setPosts(prev => [data as Post, ...prev]);
        setIsIdeaModalOpen(false);
        setNewIdeaTitle(''); setNewIdeaNotes(''); setNewIdeaUrl('');
        setSavingIdea(false);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = async (e: React.DragEvent, status: Post['status']) => {
        e.preventDefault();
        if (!draggedId) return;
        setPosts(posts.map(p => p.id === draggedId ? { ...p, status } : p));
        setDraggedId(null);
        await supabase.from('content_posts').update({ status }).eq('id', draggedId);
    };

    // Calculate Growth logic
    const currentMetrics = metricsHistory[metricsHistory.length - 1] || { followers: 0, views: 0, revenue: 0 };
    const prevMetrics = metricsHistory[metricsHistory.length - 2] || { followers: 0, views: 0, revenue: 0 };
    const followerGrowth = currentMetrics.followers - prevMetrics.followers;

    return (
        <div className="p-8 h-full overflow-y-auto relative">

            {/* --- MODALS --- */}
            {isIdeaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setIsIdeaModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-white mb-4">New Content Idea</h3>
                        <form onSubmit={handleCreateIdea} className="space-y-4">
                            <input autoFocus type="text" value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)} placeholder="Title / Concept" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                            <textarea value={newIdeaNotes} onChange={e => setNewIdeaNotes(e.target.value)} placeholder="Description..." rows={3} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white resize-none" />
                            <input type="url" value={newIdeaUrl} onChange={e => setNewIdeaUrl(e.target.value)} placeholder="Reference URL" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                            <div className="flex justify-end mt-4"><button type="submit" disabled={savingIdea} className="px-4 py-2 bg-primary text-white rounded-lg">Create</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl relative">
                        <button onClick={() => setIsLogModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-white mb-4">Log Stats: {PLATFORMS.find(p => p.id === activeTab)?.label}</h3>
                        <form onSubmit={handleLogStats} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Total Followers/Subs</label>
                                <input type="number" value={logFollowers} onChange={e => setLogFollowers(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. 15000" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Views / Reach (Today)</label>
                                <input type="number" value={logViews} onChange={e => setLogViews(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. 5000" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Revenue (Optional)</label>
                                <input type="number" value={logRevenue} onChange={e => setLogRevenue(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. 50.00" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500">Save Log</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    Social Hub
                    {view === 'planner' && <span className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">Planner</span>}
                    {view === 'metrics' && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">Metrics</span>}
                </h2>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => setView('metrics')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'metrics' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Metrics</button>
                    <button onClick={() => setView('planner')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'planner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Planner</button>
                </div>
            </div>

            {view === 'metrics' ? (
                <div className="animate-fade-in space-y-6">
                    {/* Platform Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
                        {PLATFORMS.map(platform => (
                            <button
                                key={platform.id}
                                onClick={() => setActiveTab(platform.id)}
                                className={`pb-3 px-6 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === platform.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {platform.label}
                                {activeTab === platform.id && <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: platform.color, boxShadow: `0 0 10px ${platform.color}80` }} />}
                            </button>
                        ))}
                    </div>

                    {/* Scorecards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total {activeTab === 'telegram' ? 'Subscribers' : 'Followers'}</p>
                                <Users size={16} className="text-slate-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">{currentMetrics.followers.toLocaleString()}</h3>
                            <span className={`text-xs ${followerGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {followerGrowth >= 0 ? '+' : ''}{followerGrowth} vs last entry
                            </span>
                        </div>

                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Views / Reach</p>
                                <Eye size={16} className="text-slate-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">{currentMetrics.views.toLocaleString()}</h3>
                            <span className="text-xs text-slate-500">Recorded today</span>
                        </div>

                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">EST. Revenue</p>
                                <DollarSign size={16} className="text-slate-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-white">${currentMetrics.revenue.toLocaleString()}</h3>
                            <span className="text-xs text-slate-500">Recorded today</span>
                        </div>
                    </div>

                    {/* Chart & Action */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[300px]">
                            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-violet-400" /> Growth Trend
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metricsHistory}>
                                        <defs>
                                            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PLATFORMS.find(p => p.id === activeTab)?.color || '#8884d8'} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={PLATFORMS.find(p => p.id === activeTab)?.color || '#8884d8'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="followers"
                                            stroke={PLATFORMS.find(p => p.id === activeTab)?.color || '#8884d8'}
                                            fillOpacity={1}
                                            fill="url(#colorFollowers)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-6 text-center">
                                <p className="text-slate-400 mb-4">Update your numbers for {PLATFORMS.find(p => p.id === activeTab)?.label} today.</p>
                                <button
                                    onClick={() => setIsLogModalOpen(true)}
                                    className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                                >
                                    Log Daily Stats
                                </button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-white font-medium mb-2">Strategy Tips</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {activeTab === 'telegram'
                                        ? "Focus on exclusive behind-the-scenes content to convert free followers to VIP subscribers."
                                        : "Consistency is key. Use the Planner to schedule at least 3 posts per week to maintain growth."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // PLANNER UI (Kanban)
                <div className="animate-fade-in h-[calc(100vh-200px)] flex flex-col">
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-slate-400 text-sm">Drag and drop cards manually.</p>
                        <button onClick={() => setIsIdeaModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-violet-900/20">
                            <Plus size={18} /> New Idea
                        </button>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                        <div className="flex gap-4 h-full min-w-[1200px]">
                            {COLUMNS.map(col => (
                                <div key={col.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id as Post['status'])} className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl min-w-[280px]">
                                    <div className="p-3 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur rounded-t-xl z-10">
                                        <h3 className="font-semibold text-slate-200 text-sm">{col.label}</h3>
                                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-500">{posts.filter(p => p.status === col.id).length}</span>
                                    </div>
                                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                                        {posts.filter(p => p.status === col.id).map(post => (
                                            <div key={post.id} draggable onDragStart={(e) => handleDragStart(e, post.id)} className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-move hover:border-slate-500 hover:shadow-lg transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-700 text-slate-400">{post.platform}</span>
                                                    <GripVertical size={14} className="text-slate-600 opacity-0 group-hover:opacity-100" />
                                                </div>
                                                <h4 className="text-sm font-medium text-white mb-2 leading-tight">{post.title}</h4>
                                                {(post.notes || post.reference_url) && <div className="mb-3 text-xs text-slate-400 line-clamp-2">{post.notes}</div>}
                                                <div className="flex items-center gap-3 text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
                                                    {post.reference_url && <a href={post.reference_url} target="_blank" className="text-blue-400"><LinkIcon size={12} /></a>}
                                                    {post.notes && <Type size={12} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Social;
