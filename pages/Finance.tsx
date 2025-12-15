import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Plus } from 'lucide-react';

const data = [
  { name: 'OnlyFans', value: 4500 },
  { name: 'Fansly', value: 1200 },
  { name: 'Telegram', value: 3800 },
  { name: 'Wishlist', value: 500 },
];

const COLORS = ['#8b5cf6', '#f43f5e', '#0ea5e9', '#10b981'];

const transactions = [
    { id: 1, desc: "Tip from @DaddySteve", amount: 50, platform: "OnlyFans", date: "Today, 10:42 AM", type: "income" },
    { id: 2, desc: "Subscription Renewal", amount: 15, platform: "Fansly", date: "Today, 9:15 AM", type: "income" },
    { id: 3, desc: "Custom Video Deposit", amount: 150, platform: "Telegram", date: "Yesterday", type: "income" },
    { id: 4, desc: "Video Editor Payment", amount: -200, platform: "PayPal", date: "Yesterday", type: "expense" },
];

const Finance = () => {
    return (
        <div className="p-8 h-full overflow-y-auto">
             <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Financial Overview</h2>
                    <p className="text-slate-400 mt-1">Track your empire's growth.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-violet-900/20">
                        <Plus size={18} /> New Goal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-white w-full mb-4">Revenue Sources</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                        {data.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-xs text-slate-300">{d.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-white">${d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goals & Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Monthly Goal</h3>
                        <div className="text-center py-8">
                             <div className="text-4xl font-bold text-white mb-2">$8,450 <span className="text-lg text-slate-500 font-normal">/ $10,000</span></div>
                             <p className="text-slate-400 text-sm">You are 84.5% there! Keep pushing.</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden mb-2">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[84.5%]" />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Started: $0</span>
                            <span>Target: $10k</span>
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <h4 className="font-medium text-white text-sm mb-1">Tip</h4>
                        <p className="text-xs text-slate-400">Launch a "Flash Sale" on Friday to close the gap of $1,550.</p>
                    </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="pb-3 pl-2">Description</th>
                                    <th className="pb-3">Platform</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 text-right pr-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="group hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-0">
                                        <td className="py-4 pl-2 font-medium text-white">{t.desc}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${t.platform === 'OnlyFans' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : t.platform === 'Fansly' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                {t.platform}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-400">{t.date}</td>
                                        <td className={`py-4 text-right pr-2 font-mono font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
