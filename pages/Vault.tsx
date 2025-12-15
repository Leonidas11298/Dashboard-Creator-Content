import React, { useState, useEffect } from 'react';
import { Search, Filter, Lock, Tag, Copy, Plus, Folder, Video, Image as ImageIcon, FileText, X, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

// DB Type
interface Asset {
    id: string;
    title: string;
    drive_link: string;
    thumbnail_url: string;
    type: 'image' | 'video' | 'document' | 'folder';
    tags: string[];
    price: number;
    created_at: string;
}

const Vault = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newType, setNewType] = useState<Asset['type']>('image');
    const [newPrice, setNewPrice] = useState('');
    const [newTags, setNewTags] = useState('');
    const [saving, setSaving] = useState(false);

    // Two-step delete state
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vault_assets').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching assets:', error);
        else setAssets(data as Asset[] || []);
        setLoading(false);
    };

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newLink) return;

        setSaving(true);
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

        const newAsset = {
            title: newTitle,
            drive_link: newLink,
            type: newType,
            price: parseFloat(newPrice) || 0,
            tags: tagsArray
        };

        const { data, error } = await supabase.from('vault_assets').insert(newAsset).select().single();
        if (error) {
            alert('Error adding asset: ' + error.message);
        } else {
            if (data) setAssets(prev => [data as Asset, ...prev]);
            // Reset
            setNewTitle(''); setNewLink(''); setNewPrice(''); setNewTags(''); setIsAddModalOpen(false);
        }
        setSaving(false);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmDeleteId === id) {
            // Actually Delete
            executeDelete(id);
        } else {
            // First Click - Ask for confirmation
            setConfirmDeleteId(id);
        }
    };

    const executeDelete = async (id: string) => {
        const { error } = await supabase.from('vault_assets').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            setAssets(prev => prev.filter(a => a.id !== id));
            setConfirmDeleteId(null);
        }
    };

    const handleMouseLeave = () => {
        if (confirmDeleteId) setConfirmDeleteId(null);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'folder': return <Folder className="text-yellow-400" size={40} />;
            case 'video': return <Video className="text-rose-400" size={40} />;
            case 'document': return <FileText className="text-blue-400" size={40} />;
            default: return <ImageIcon className="text-purple-400" size={40} />;
        }
    };

    const filteredAssets = assets.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 h-full overflow-y-auto relative">

            {/* Add Asset Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-white mb-4">Add Drive Asset</h3>
                        <form onSubmit={handleAddAsset} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400">Title</label>
                                <input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="Summer Photoset" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Google Drive Link</label>
                                <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="https://drive.google.com/..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Type</label>
                                    <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white">
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="folder">Folder</option>
                                        <option value="document">Document</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Price ($)</label>
                                    <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Tags (comma separated)</label>
                                <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="feet, beach, custom" />
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-violet-600 shadow-lg shadow-violet-900/20 mt-2">
                                {saving ? 'Saving...' : 'Add Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Content Vault</h2>
                    <p className="text-slate-400 mt-1">Organize your Google Drive assets.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by tags or title..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-violet-900/20"
                    >
                        <Plus size={18} /> Add
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                    <div
                        key={asset.id}
                        onMouseLeave={handleMouseLeave}
                        className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10"
                    >
                        {/* Thumbnail / Icon Area */}
                        <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                            {/* Icon Display */}
                            <div className="transform group-hover:scale-110 transition-transform duration-300">
                                {getTypeIcon(asset.type)}
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                {/* Hide other buttons if deleting to avoid distraction/clicking wrong thing */}
                                {confirmDeleteId !== asset.id && (
                                    <div className="flex flex-col gap-2 w-full items-center animate-fade-in">
                                        <a
                                            href={asset.drive_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full max-w-[140px] px-4 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-slate-200 flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={14} /> Open
                                        </a>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(asset.drive_link)}
                                            className="w-full max-w-[140px] px-4 py-2 bg-slate-800 text-white font-bold text-sm rounded-full border border-slate-600 flex items-center justify-center gap-2 hover:bg-slate-700"
                                        >
                                            <Copy size={14} /> Copy
                                        </button>
                                    </div>
                                )}

                                {/* Two-Step Delete Button */}
                                <button
                                    onClick={(e) => handleDeleteClick(asset.id, e)}
                                    className={`mt-auto text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded transition-all duration-200 ${confirmDeleteId === asset.id
                                            ? 'bg-red-600 text-white scale-110 shadow-lg animate-pulse mb-auto mt-auto'
                                            : 'text-red-400 hover:text-red-300 hover:bg-red-500/10 transform translate-y-4 group-hover:translate-y-0 delay-100'
                                        }`}
                                >
                                    <Trash2 size={12} />
                                    {confirmDeleteId === asset.id ? 'CONFIRM DELETE?' : 'Remove'}
                                </button>
                            </div>
                        </div>

                        <div className="p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-white truncate w-full" title={asset.title}>{asset.title}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500 capitalize">{asset.type}</span>
                                {asset.price > 0 && (
                                    <span className="text-xs font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">${asset.price}</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1 h-6 overflow-hidden">
                                {asset.tags?.map((tag, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredAssets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <Folder size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No assets found. Upload something!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vault;
