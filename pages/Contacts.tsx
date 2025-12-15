import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { User } from '../types';

const Contacts = () => {
    // Mock Data for display
    const users: User[] = [
        { id: '1', name: 'DaddySteve_99', avatar: 'https://picsum.photos/id/1012/200', ltv: 12500, platform: 'of', status: 'online', isWhale: true, tags: ['Sub'], purchasedAssets: [] },
        { id: '2', name: 'CryptoJohn', avatar: 'https://picsum.photos/id/1025/200', ltv: 8500, platform: 'telegram', status: 'offline', isWhale: true, tags: ['Crypto'], purchasedAssets: [] },
        { id: '3', name: 'SimpForU', avatar: 'https://picsum.photos/id/1005/200', ltv: 320, platform: 'of', status: 'online', isWhale: false, tags: [], purchasedAssets: [] },
        { id: '4', name: 'Ghoster123', avatar: 'https://picsum.photos/id/1001/200', ltv: 50, platform: 'insta', status: 'offline', isWhale: false, tags: [], purchasedAssets: [] },
    ];

    return (
        <div className="p-8 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">CRM / Contacts</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700">Import CSV</button>
                    <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-violet-600">Export Whales</button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-xs text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="p-4 border-b border-slate-800">User</th>
                            <th className="p-4 border-b border-slate-800">Platform</th>
                            <th className="p-4 border-b border-slate-800">LTV</th>
                            <th className="p-4 border-b border-slate-800">Status</th>
                            <th className="p-4 border-b border-slate-800">Tags</th>
                            <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/50 group transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium text-white flex items-center gap-1">
                                            {user.name} 
                                            {user.isWhale && <span title="Whale">🐳</span>}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${user.platform === 'of' ? 'bg-blue-500/20 text-blue-400' : 'bg-sky-500/20 text-sky-400'}`}>
                                        {user.platform}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-green-400 font-medium">
                                    ${user.ltv.toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.status === 'online' ? 'bg-green-500' : 'bg-slate-600'}`} />
                                    <span className="text-slate-400 capitalize">{user.status}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {user.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-slate-500 hover:text-white"><MoreHorizontal size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contacts;
