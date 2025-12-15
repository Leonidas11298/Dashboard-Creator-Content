import React, { useState } from 'react';
import { Share2, Heart, MessageCircle, Eye, BarChart } from 'lucide-react';

const Social = () => {
    const [activeTab, setActiveTab] = useState<'tiktok' | 'twitter' | 'insta'>('tiktok');

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Social Command Center</h2>

            {/* Platform Tabs */}
            <div className="flex gap-2 mb-8 border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('tiktok')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeTab === 'tiktok' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    TikTok
                    {activeTab === 'tiktok' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                </button>
                <button 
                    onClick={() => setActiveTab('twitter')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeTab === 'twitter' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    X (Twitter)
                    {activeTab === 'twitter' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                </button>
                <button 
                    onClick={() => setActiveTab('insta')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeTab === 'insta' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Instagram
                    {activeTab === 'insta' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />}
                </button>
            </div>

            {/* Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Followers</p>
                    <h3 className="text-2xl font-bold text-white mt-1">128.4K</h3>
                    <span className="text-xs text-green-400">+1.2K today</span>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Profile Views</p>
                    <h3 className="text-2xl font-bold text-white mt-1">45.2K</h3>
                    <span className="text-xs text-green-400">+5% vs last week</span>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Link Taps</p>
                    <h3 className="text-2xl font-bold text-white mt-1">3,402</h3>
                    <span className="text-xs text-yellow-400">7.5% CTR</span>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Estimated Earnings</p>
                    <h3 className="text-2xl font-bold text-white mt-1">$850</h3>
                    <span className="text-xs text-slate-500">From social traffic</span>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="font-semibold text-white">Top Performing Content</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="p-4">Content</th>
                            <th className="p-4">Stats</th>
                            <th className="p-4">Engagement</th>
                            <th className="p-4">Conversion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-20 bg-slate-800 rounded-lg overflow-hidden relative">
                                            <img src={`https://picsum.photos/200/300?random=${i}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Share2 size={16} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white line-clamp-1">Viral trend challenge #fyp</p>
                                            <p className="text-xs text-slate-500">Posted 2h ago</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-300">
                                        <span className="flex items-center gap-1"><Eye size={14} className="text-slate-500"/> 245K</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-300">
                                        <span className="flex items-center gap-1"><Heart size={14} className="text-rose-500"/> 12K</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={14} className="text-blue-400"/> 450</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart size={16} className="text-green-500" />
                                        <span className="text-sm font-bold text-white">2.4%</span>
                                        <span className="text-xs text-slate-500">(12 Subs)</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Social;
