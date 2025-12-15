import React from 'react';
import { Search, Filter, Lock, Tag, Copy } from 'lucide-react';

const Vault = () => {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Content Vault</h2>
                    <p className="text-slate-400 mt-1">Manage, price, and distribute your assets.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by tags (e.g. feet, beach)..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-primary/50 transition-all">
                        <div className="aspect-[3/4] overflow-hidden relative">
                             <img src={`https://picsum.photos/300/400?random=${i + 10}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             {/* Overlay */}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                 <button className="px-4 py-2 bg-white text-black font-bold text-sm rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                     Details
                                 </button>
                                 <button className="px-4 py-2 bg-slate-800 text-white font-bold text-sm rounded-full border border-slate-600 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75 flex items-center gap-2 hover:bg-slate-700">
                                    <Copy size={14} /> Copy Link
                                 </button>
                             </div>
                             {i % 3 === 0 && <div className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur rounded-md text-white"><Lock size={14} /></div>}
                        </div>
                        <div className="p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-white truncate">Photoset #{i + 203}</span>
                                <span className="text-xs font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">$15</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#feet</span>
                                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#outdoor</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Vault;
