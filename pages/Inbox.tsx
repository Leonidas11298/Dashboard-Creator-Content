import React, { useState, useEffect, useRef } from 'react';
import {
    Hash, Search, Send, Zap, MoreVertical, Users, Plus, Settings, MessageSquare, Lock, X, Circle
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';

// Types
interface Member {
    id: string;
    name: string;
    role: 'admin' | 'editor' | 'manager' | 'assistant';
    avatar_url: string;
    status: 'online' | 'busy' | 'offline';
    user_id?: string; // Linked Auth ID
}

interface Channel {
    id: string;
    slug: string;
    name: string;
    description: string;
}

interface Message {
    id: string;
    channel_id?: string;
    sender_id: string;
    receiver_id?: string;
    content: string;
    created_at: string;
    sender?: Member;
}

interface InboxProps {
    currentUserId: string | null;
    currentUserRole: string | null;
}

const Inbox = ({ currentUserId, currentUserRole }: InboxProps) => {
    // Current User (Derived from Data + Auth)
    const [currentUser, setCurrentUser] = useState<Member | null>(null);

    // Data State
    const [channels, setChannels] = useState<Channel[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    // UI State
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null); // For DMs

    // Feature State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageSearchTerm, setMessageSearchTerm] = useState('');

    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Modals State
    // Modals State
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [isDmModalOpen, setIsDmModalOpen] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<{ id: string; slug: string } | null>(null);

    // Channel Creation Inputs
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [creatingChannel, setCreatingChannel] = useState(false);

    // Initial Load
    useEffect(() => {
        fetchInitialData();

        // Subscribe to everything
        const channelSub = supabase.channel('public:channels').on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchInitialData).subscribe();
        const memberSub = supabase.channel('public:members').on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchInitialData).subscribe();

        return () => { supabase.removeChannel(channelSub); supabase.removeChannel(memberSub); };
    }, [currentUserId]); // re-run if auth changes

    // Load Messages (Channel or DM)
    useEffect(() => {
        if (activeChannelId) {
            fetchChannelMessages(activeChannelId);
            subscribeToChannel(activeChannelId);
        } else if (activeDmUserId && currentUser) {
            fetchDmMessages(activeDmUserId);
            subscribeToDm(activeDmUserId);
        }
    }, [activeChannelId, activeDmUserId, currentUser]);

    const fetchInitialData = async () => {
        const { data: chans } = await supabase.from('channels').select('*').order('name');
        const { data: mems } = await supabase.from('team_members').select('*').order('name');

        if (chans) setChannels(chans || []);
        if (mems) {
            setMembers(mems || []);
            // Find REAL current user from DB based on Auth ID
            if (currentUserId) {
                const me = mems.find(m => m.user_id === currentUserId);
                if (me) setCurrentUser(me);
            }
        }

        // Default to first channel if nothing selected
        if (!activeChannelId && !activeDmUserId && chans && chans.length > 0) {
            // Keep current selection if valid, else pick first
            setActiveChannelId(prev => prev || chans[0].id);
        }
        setLoading(false);
    };

    // --- FETCHING ---

    const fetchChannelMessages = async (channelId: string) => {
        const { data } = await supabase
            .from('team_messages')
            .select('*')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            scrollToBottom();
        }
    };

    const fetchDmMessages = async (otherUserId: string) => {
        if (!currentUser) return;

        // Mark as read immediately when opening
        await markAsRead(otherUserId);

        // Fetch where (sender=me AND receiver=them) OR (sender=them AND receiver=me)
        const { data } = await supabase
            .from('team_messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            scrollToBottom();
        }
    };

    const markAsRead = async (senderId: string) => {
        if (!currentUser) return;
        const { error } = await supabase
            .from('team_messages')
            .update({ is_read: true })
            .eq('sender_id', senderId)
            .eq('receiver_id', currentUser.id)
            .eq('is_read', false);

        if (error) console.error('Error marking read:', error);
    };

    // --- SUBSCRIPTIONS ---

    const subscribeToChannel = (channelId: string) => {
        supabase.removeAllChannels(); // Simple cleanup for MVP
        const sub = supabase.channel(`chat:channel:${channelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'team_messages',
                filter: `channel_id=eq.${channelId}`
            }, (payload) => handleNewMessage(payload.new as Message))
            .subscribe();
    }

    const subscribeToDm = (otherUserId: string) => {
        if (!currentUser) return;
        supabase.removeAllChannels();

        const sub = supabase.channel(`chat:dm:${otherUserId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_messages' }, (payload) => {
                const msg = payload.new as Message;
                // Only add if it belongs to this conversation
                const isRelevant =
                    (msg.sender_id === currentUser.id && msg.receiver_id === otherUserId) ||
                    (msg.sender_id === otherUserId && msg.receiver_id === currentUser.id);

                if (isRelevant) handleNewMessage(msg);
            })
            .subscribe();
    };

    const handleNewMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();

        // If I am receiving this message and I have this DM open, mark as read
        if (activeDmUserId && msg.sender_id === activeDmUserId && msg.receiver_id === currentUser?.id) {
            markAsRead(msg.sender_id);
        }
    };

    // --- ACTIONS ---

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName) return;

        setCreatingChannel(true);
        let slug = newChannelName.toLowerCase().replace(/\s+/g, '-');
        if (!slug.startsWith('#')) slug = '#' + slug;

        const { data, error } = await supabase.from('channels').insert({
            slug: slug,
            name: newChannelName,
            description: newChannelDesc,
            type: 'public'
        }).select().single();

        if (error) {
            alert('Error creating channel: ' + error.message);
        } else if (data) {
            setChannels(prev => [...prev, data as Channel]);
            selectChannel(data.id);
            setIsChannelModalOpen(false);
            setNewChannelName('');
            setNewChannelDesc('');
        }
        setCreatingChannel(false);
    };

    const handleDeleteChannel = (id: string, slug: string) => {
        setChannelToDelete({ id, slug });
    };

    const confirmDeleteChannel = async () => {
        if (!channelToDelete) return;

        try {
            const { error, count } = await supabase
                .from('channels')
                .delete({ count: 'exact' })
                .eq('id', channelToDelete.id);

            if (error) {
                console.error('Delete error:', error);
                alert('Error deleting channel: ' + error.message);
            } else if (count === 0) {
                alert('Could not delete channel. You might not have permission, or it was already deleted.');
            } else {
                // Optimistic update
                setChannels(prev => prev.filter(c => c.id !== channelToDelete.id));
                if (activeChannelId === channelToDelete.id) setActiveChannelId(null);
                setChannelToDelete(null);
            }
        } catch (err: any) {
            console.error('Unexpected error:', err);
            alert('Unexpected error: ' + err.message);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !currentUser) return;

        const text = inputText;
        setInputText('');

        const msgData: any = {
            sender_id: currentUser.id,
            content: text,
        };

        if (activeChannelId) {
            msgData.channel_id = activeChannelId;
        } else if (activeDmUserId) {
            msgData.receiver_id = activeDmUserId;
        } else {
            return;
        }

        const { error } = await supabase.from('team_messages').insert(msgData);
        if (error) {
            console.error('Send error:', error);
            alert('Failed to send');
            setInputText(text);
        }
    };

    const selectChannel = (id: string) => {
        setActiveChannelId(id);
        setActiveDmUserId(null);
        setIsSearchOpen(false); // Close search on switch
        setMessageSearchTerm('');
        setIsDmModalOpen(false);
    };

    const selectDm = (userId: string) => {
        setActiveDmUserId(userId);
        setActiveChannelId(null);
        setIsSearchOpen(false);
        setMessageSearchTerm('');
        setIsDmModalOpen(false);
    };

    const handleCloseChat = () => {
        setActiveChannelId(null);
        setActiveDmUserId(null);
        setIsMenuOpen(false);
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // --- RENDER HELPERS ---

    const activeChannelObj = channels.find(c => c.id === activeChannelId);
    const activeDmUserObj = members.find(m => m.id === activeDmUserId);

    const availableMembers = members.filter(m => m.id !== currentUser?.id);

    // Filter messages for search
    const enrichedMessages = messages
        .filter(msg => {
            if (!messageSearchTerm) return true;
            return msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase());
        })
        .map(msg => ({
            ...msg,
            sender: members.find(m => m.id === msg.sender_id) || { name: 'Unknown', avatar_url: '', role: 'assistant', status: 'offline' } as Member
        }));

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950 relative">

            {/* Confirmation Modal */}
            {channelToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl relative">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Channel?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Are you sure you want to delete <span className="text-white font-bold">#{channelToDelete.slug}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setChannelToDelete(null)}
                                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteChannel}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Channel Modal */}
            {isChannelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl relative animate-fade-in-up">
                        <button onClick={() => setIsChannelModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-slate-800 rounded-lg text-primary"><Hash size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-white">New Channel</h3>
                                <p className="text-xs text-slate-400">Create a space for your team.</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreateChannel} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Channel Name</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">#</span>
                                    <input autoFocus type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-7 pr-4 text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-600" placeholder="planning" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Description</label>
                                <input type="text" value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-600" placeholder="Purpose of this channel" />
                            </div>
                            <button type="submit" disabled={creatingChannel || !newChannelName} className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-violet-600 shadow-lg shadow-violet-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                {creatingChannel ? 'Creating...' : 'Create Channel'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* New DM Modal */}
            {isDmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl relative animate-fade-in-up">
                        <button onClick={() => setIsDmModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-slate-800 rounded-lg text-green-500"><MessageSquare size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-white">New Message</h3>
                                <p className="text-xs text-slate-400">Select a team member to chat with.</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                            {availableMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => selectDm(member.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="relative">
                                        <img src={member.avatar_url} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${member.status === 'online' ? 'bg-green-500' :
                                            member.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                                            }`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white">{member.name}</h4>
                                        <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                                    </div>
                                </button>
                            ))}
                            {availableMembers.length === 0 && (
                                <p className="text-center text-slate-500 py-4 text-sm">No other team members found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Users className="text-primary" size={20} /> Team HQ
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* CHANNELS */}
                    <div className="mb-6 px-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2 flex justify-between items-center group">
                            Channels
                            {currentUserRole === 'admin' && (
                                <button onClick={() => setIsChannelModalOpen(true)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Plus size={14} /></button>
                            )}
                        </h3>
                        <div className="space-y-0.5">
                            {channels.map(ch => (
                                <div key={ch.id} className="relative group/channel">
                                    <button
                                        onClick={() => selectChannel(ch.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${activeChannelId === ch.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                    >
                                        <Hash size={14} className="opacity-50" /> {ch.slug}
                                    </button>

                                    {currentUserRole === 'admin' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChannel(ch.id, ch.slug);
                                            }}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-400 z-50 hover:bg-slate-900 rounded-full"
                                            title="Delete Channel"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TEAM MEMBERS (DMs) */}
                    <div className="px-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Direct Messages</h3>
                        <div className="space-y-1">
                            {availableMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => selectDm(member.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${activeDmUserId === member.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                >
                                    <div className="relative">
                                        <img src={member.avatar_url} className="w-5 h-5 rounded-full bg-slate-800 object-cover" />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-slate-900 ${member.status === 'online' ? 'bg-green-500' :
                                            member.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                                            }`} />
                                    </div>
                                    <span>{member.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current User */}
                <div className="p-3 bg-slate-900/50 border-t border-slate-800 flex items-center gap-3">
                    {currentUser && (
                        <>
                            <img src={currentUser.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{currentUser.status}</p>
                            </div>
                            <Settings size={16} className="text-slate-500 hover:text-white cursor-pointer" />
                        </>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {!activeChannelId && !activeDmUserId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-violet-900/10 rotate-3 transition-transform hover:rotate-6">
                            <MessageSquare size={40} className="text-slate-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Team HQ</h2>
                        <p className="max-w-md text-slate-400 mb-8">Select a channel or team member from the sidebar to start collaborating.</p>

                        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer group" onClick={() => setIsChannelModalOpen(true)}>
                                <div className="p-2 bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Hash size={16} />
                                </div>
                                <div className="font-bold text-slate-200">Create Channel</div>
                                <div className="text-xs text-slate-500 mt-1">Start a new topic</div>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer group" onClick={() => setIsDmModalOpen(true)}>
                                <div className="p-2 bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Users size={16} />
                                </div>
                                <div className="font-bold text-slate-200">Direct Message</div>
                                <div className="text-xs text-slate-500 mt-1">Chat privately</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/30 backdrop-blur relative">
                            {isSearchOpen ? (
                                <div className="flex-1 flex items-center gap-2 animate-fade-in">
                                    <Search size={18} className="text-primary" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={messageSearchTerm}
                                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                                        placeholder="Search messages..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 h-full"
                                    />
                                    <button onClick={() => { setIsSearchOpen(false); setMessageSearchTerm(''); }} className="p-1 hover:bg-slate-800 rounded">
                                        <X size={18} className="text-slate-400" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {activeChannelId ? (
                                        <>
                                            <Hash size={20} className="text-slate-400" />
                                            <div>
                                                <h3 className="font-bold text-white">{activeChannelObj?.slug}</h3>
                                                <p className="text-xs text-slate-500 hidden md:block">{activeChannelObj?.description}</p>
                                            </div>
                                        </>
                                    ) : activeDmUserId ? (
                                        <>
                                            <img src={activeDmUserObj?.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                                            <div>
                                                <h3 className="font-bold text-white">{activeDmUserObj?.name}</h3>
                                                <p className="text-xs text-green-500 flex items-center gap-1">● {activeDmUserObj?.status}</p>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-slate-400 relative">
                                {/* More Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-800'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {/* Dropdown */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                            <button
                                                onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3"
                                            >
                                                <Search size={16} /> Search Chat
                                            </button>
                                            <button
                                                onClick={() => { alert('Notifications settings coming soon!'); setIsMenuOpen(false); }}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3"
                                            >
                                                <Zap size={16} /> Notifications
                                            </button>
                                            <div className="h-px bg-slate-800 my-0" />
                                            <button
                                                onClick={handleCloseChat}
                                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                                            >
                                                <X size={16} /> Close Chat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Results Count */}
                        {messageSearchTerm && (
                            <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 text-xs text-slate-400">
                                Found {enrichedMessages.length} match{enrichedMessages.length !== 1 && 'es'} for "{messageSearchTerm}"
                            </div>
                        )}

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                            {loading ? (
                                <div className="flex justify-center pt-10"><span className="text-slate-500">Loading HQ...</span></div>
                            ) : (
                                enrichedMessages.map((msg, i) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    const showHeader = i === 0 || enrichedMessages[i - 1].sender_id !== msg.sender_id;

                                    return (
                                        <div key={msg.id} className={`flex gap-4 ${showHeader ? 'mt-4' : 'mt-1'} group ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {showHeader ? (
                                                <img src={msg.sender?.avatar_url} className="w-10 h-10 rounded-full bg-slate-800 shrink-0 object-cover" />
                                            ) : (
                                                <div className="w-10 shrink-0" /> // Spacer
                                            )}

                                            <div className={`flex-1 min-w-0 max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                                                {showHeader && (
                                                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <span className="font-bold text-slate-200">{msg.sender?.name}</span>
                                                        <span className="text-[10px] text-slate-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                <div className={`inline-block text-left p-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 px-6 mb-2">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-end gap-2 focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-lg">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                    <Plus size={20} />
                                </button>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder={`Message ${activeChannelId ? activeChannelObj?.slug : activeDmUserId ? activeDmUserObj?.name : '...'}`}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 resize-none max-h-32 py-2.5 min-h-[44px] placeholder:text-slate-600"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

export default Inbox;
