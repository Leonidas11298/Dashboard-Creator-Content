import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Plus } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import GoalModal from '../components/GoalModal';

// Helper for currency
const formatMoney = (val: number) => `$${val.toLocaleString()}`;

const COLORS = ['#8b5cf6', '#f43f5e', '#0ea5e9', '#10b981'];

const Finance = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState(10000); // Default fallback
    const [isGoalOpen, setIsGoalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Recent Transactions
                const { data: txData, error: txError } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (txError) throw txError;
                setTransactions(txData || []);

                // 2. Fetch Latest Goal
                const { data: goalData } = await supabase
                    .from('goals')
                    .select('target_amount')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (goalData) setGoal(Number(goalData.target_amount));

                // 3. Calculate Aggregates for Pie Chart & Monthly Goal
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

                const { data: monthData, error: monthError } = await supabase
                    .from('transactions')
                    .select('amount, platform, type')
                    .eq('type', 'income')
                    .gte('created_at', startOfMonth);

                if (monthError) throw monthError;

                if (monthData) {
                    // Monthly Total
                    const total = monthData.reduce((sum, t) => sum + Number(t.amount), 0);
                    setMonthlyRevenue(total);

                    // Pie Chart Data
                    const platformMap: Record<string, number> = {};
                    monthData.forEach(t => {
                        const p = t.platform || 'Other';
                        platformMap[p] = (platformMap[p] || 0) + Number(t.amount);
                    });

                    const newPieData = Object.entries(platformMap).map(([name, value]) => ({
                        name: name === 'of' ? 'OnlyFans' : name.charAt(0).toUpperCase() + name.slice(1),
                        value
                    }));
                    setPieData(newPieData.length > 0 ? newPieData : [{ name: 'No Data', value: 1 }]);
                }

            } catch (error) {
                console.error('Error fetching finance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshKey]);

    const percentage = Math.min((monthlyRevenue / goal) * 100, 100);

    return (
        <div className="p-8 h-full overflow-y-auto pb-24">
            <GoalModal
                isOpen={isGoalOpen}
                onClose={() => setIsGoalOpen(false)}
                onSuccess={() => setRefreshKey(prev => prev + 1)}
            />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Financial Overview</h2>
                    <p className="text-slate-400 mt-1">Track your empire's growth.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                        <Download size={18} /> Export CSV
                    </button>
                    <button
                        onClick={() => setIsGoalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-violet-900/20"
                    >
                        <Plus size={18} /> New Goal
                    </button>
                </div>
            </div>

            {/* Changed from lg:grid-cols-3 to lg:grid-cols-2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-white w-full mb-4">Revenue Sources (This Month)</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val: number) => `$${val}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                        {pieData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs text-slate-300 capitalize">{d.name}</span>
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
                            <div className="text-4xl font-bold text-white mb-2">
                                {formatMoney(monthlyRevenue)} <span className="text-lg text-slate-500 font-normal">/ {formatMoney(goal)}</span>
                            </div>
                            <p className="text-slate-400 text-sm">You are {percentage.toFixed(1)}% there! Keep pushing.</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Started: $0</span>
                            <span>Target: {formatMoney(goal)}</span>
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <h4 className="font-medium text-white text-sm mb-1">Tip</h4>
                        <p className="text-xs text-slate-400">Launch a "Flash Sale" on Friday to close the gap of {formatMoney(Math.max(0, goal - monthlyRevenue))}.</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
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
                                {transactions.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500">No transactions found. Add one!</td>
                                    </tr>
                                )}
                                {transactions.map((t) => (
                                    <tr key={t.id} className="group hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-0">
                                        <td className="py-4 pl-2 font-medium text-white">{t.description || 'No Description'}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs border capitalize ${t.platform === 'of' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    t.platform === 'fansly' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                        'bg-slate-700 text-slate-300 border-slate-600'
                                                }`}>
                                                {t.platform === 'of' ? 'OnlyFans' : t.platform || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                                        <td className={`py-4 text-right pr-2 font-mono font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Math.abs(Number(t.amount))}
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
