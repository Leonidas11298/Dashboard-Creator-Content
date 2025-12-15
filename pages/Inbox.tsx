import React, { useState } from 'react';
import { 
    Search, Filter, Paperclip, Send, Zap, Image as ImageIcon, 
    MoreVertical, Phone, Video, CreditCard, ChevronRight, Hash
} from 'lucide-react';
import { User, Message, Conversation } from '../types';

// Mock Data
const conversations: Conversation[] = [
    {
        id: '1',
        userId: 'u1',
        user: { id: 'u1', name: 'DaddySteve_99', avatar: 'https://picsum.photos/id/1012/200', ltv: 12500, platform: 'of', status: 'online', isWhale: true, tags: ['Submissive', 'Feet'], purchasedAssets: [] },
        lastMessage: "I sent the tip, did you get it?",
        lastMessageTime: '2m',
        unreadCount: 1,
        messages: [
            { id: 'm1', sender: 'user', text: "Hey goddess, are you online?", timestamp: '10:00 AM' },
            { id: 'm2', sender: 'me', text: "Always for you babe. What's on your mind?", timestamp: '10:05 AM' },
            { id: 'm3', sender: 'user', text: "I sent the tip, did you get it?", timestamp: '10:10 AM' }
        ]
    },
    {
        id: '2',
        userId: 'u2',
        user: { id: 'u2', name: 'CryptoKing', avatar: 'https://picsum.photos/id/1025/200', ltv: 450, platform: 'telegram', status: 'offline', isWhale: false, tags: ['Crypto', 'Late Night'], purchasedAssets: [] },
        lastMessage: "Can I get a custom?",
        lastMessageTime: '1h',
        unreadCount: 0,
        messages: []
    }
];

const Inbox = () => {
    const [selectedId, setSelectedId] = useState<string>(conversations[0].id);
    const [inputText, setInputText] = useState('');
    const [showScripts, setShowScripts] = useState(false);
    
    const activeConv = conversations.find(c => c.id === selectedId) || conversations[0];

    const handleSend = () => {
        if(!inputText.trim()) return;
        // Optimistic UI update logic would go here
        setInputText('');
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Column 1: Filters (Small) & List (Medium) - Combined for simplicity in code but visually split */}
            <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900 flex-shrink-0">
                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-800 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search inbox..." 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded py-1 font-medium">All</button>
                        <button className="flex-1 text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded py-1 hover:text-white">Unread</button>
                        <button className="flex-1 text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded py-1 hover:text-white">Whales</button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`p-4 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedId === conv.id ? 'bg-slate-800 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={conv.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        {conv.user.isWhale && (
                                            <span className="absolute -top-1 -right-1 text-lg" title="Whale">🐳</span>
                                        )}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${conv.user.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`} />
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold text-sm ${conv.unreadCount > 0 ? 'text-white' : 'text-slate-300'}`}>{conv.user.name}</h4>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
                                            {conv.user.platform === 'of' ? <span className="text-blue-400">OnlyFans</span> : <span className="text-sky-400">Telegram</span>}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{conv.lastMessageTime}</span>
                            </div>
                            <p className={`text-sm line-clamp-1 mt-2 ${conv.unreadCount > 0 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                                {conv.lastMessage}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 2: Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950 relative min-w-0">
                {/* Chat Header */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <img src={activeConv.user.avatar} className="w-8 h-8 rounded-full" />
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {activeConv.user.name}
                                {activeConv.user.ltv > 1000 && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full font-bold border border-yellow-500/30">VIP</span>}
                            </h3>
                            <span className="text-xs text-green-400 flex items-center gap-1">● Online Now</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="text-right hidden lg:block">
                            <span className="block text-[10px] text-slate-500 uppercase">Lifetime Value</span>
                            <span className="text-lg font-bold text-green-400 font-mono">${activeConv.user.ltv.toLocaleString()}</span>
                         </div>
                         <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden lg:block" />
                         <div className="flex gap-2 text-slate-400">
                             <button className="p-2 hover:bg-slate-800 rounded-full"><Phone size={18} /></button>
                             <button className="p-2 hover:bg-slate-800 rounded-full"><Video size={18} /></button>
                             <button className="p-2 hover:bg-slate-800 rounded-full"><MoreVertical size={18} /></button>
                         </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeConv.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-4 ${msg.sender === 'me' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <span className={`text-[10px] block mt-1 opacity-70 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    {showScripts && (
                         <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                            {['Hey baby, miss me?', 'Check out my new set 📸', 'Tip $50 for a surprise'].map((script, i) => (
                                <button key={i} onClick={() => {setInputText(script); setShowScripts(false)}} className="whitespace-nowrap px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-primary hover:text-white transition-colors">
                                    {script}
                                </button>
                            ))}
                         </div>
                    )}
                    
                    <div className="flex items-end gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 focus-within:border-slate-600 transition-colors">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Vault">
                            <ImageIcon size={20} />
                        </button>
                        <button 
                            className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors relative group" 
                            title="AI Suggestions"
                            onClick={() => setShowScripts(!showScripts)}
                        >
                            <Zap size={20} fill="currentColor" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </button>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
                            placeholder="Type a message... (Cmd+Enter to send)"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 resize-none max-h-32 py-2 min-h-[44px]"
                            rows={1}
                        />
                        <button onClick={handleSend} className="p-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Column 3: CRM / User Details (Collapsible usually, fixed here for layout) */}
            <div className="w-72 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto hidden xl:block shrink-0">
                <div className="text-center mb-6">
                    <img src={activeConv.user.avatar} className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-slate-800" />
                    <h2 className="text-lg font-bold text-white mt-3">{activeConv.user.name}</h2>
                    <p className="text-slate-400 text-sm">Joined Oct 2023</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                            Tags <Hash size={12} />
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {activeConv.user.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-300">
                                    {tag}
                                </span>
                            ))}
                            <button className="px-2 py-1 border border-dashed border-slate-600 rounded-md text-xs text-slate-500 hover:text-white hover:border-slate-400">+</button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                            Private Notes
                        </h4>
                        <textarea 
                            className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 resize-none focus:outline-none focus:border-slate-500"
                            placeholder="Add notes about this fan..."
                            defaultValue="Loves custom feet videos. Pays usually on Fridays."
                        />
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Purchases</h4>
                        <div className="space-y-2">
                            {[
                                { item: 'Custom Video (5m)', price: 100, date: '2d ago' },
                                { item: 'Feet Pack #4', price: 25, date: '1w ago' },
                            ].map((purchase, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-slate-950/50">
                                    <span className="text-slate-300">{purchase.item}</span>
                                    <div className="text-right">
                                        <div className="text-green-400 font-mono">${purchase.price}</div>
                                        <div className="text-[10px] text-slate-600">{purchase.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
