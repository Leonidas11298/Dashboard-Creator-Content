import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Search, Shield, Circle, UserCog, Save, X } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface TeamMember {
    id: string;
    name: string;
    role: 'admin' | 'editor' | 'manager' | 'assistant';
    avatar_url: string;
    status: 'online' | 'busy' | 'offline';
    last_seen?: string;
}

const ROLES = ['admin', 'editor', 'manager', 'assistant'];

const Contacts = ({ currentUserRole }: { currentUserRole: string | null }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');

    useEffect(() => {
        fetchMembers();

        // Real-time subscription for status updates
        const sub = supabase.channel('contacts_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchMembers)
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('name');

        if (error) console.error('Error fetching members:', error);
        else setMembers(data as TeamMember[] || []);
        setLoading(false);
    };

    const handleEditClick = (member: TeamMember) => {
        if (currentUserRole !== 'admin') return;
        setEditingId(member.id);
        setSelectedRole(member.role);
    };

    const handleSaveRole = async (id: string) => {
        const { error } = await supabase
            .from('team_members')
            .update({ role: selectedRole })
            .eq('id', id);

        if (error) {
            alert('Error updating role: ' + error.message);
        } else {
            setEditingId(null);
            // Optimistic update
            setMembers(prev => prev.map(m => m.id === id ? { ...m, role: selectedRole as any } : m));
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <UserCog className="text-primary" /> Team Management
                    </h2>
                    <p className="text-slate-400 mt-1">Manage permissions and view team status.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search team..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/50 text-xs text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="p-5 border-b border-slate-800">Member</th>
                            <th className="p-5 border-b border-slate-800">Status</th>
                            <th className="p-5 border-b border-slate-800">Role</th>
                            {currentUserRole === 'admin' && (
                                <th className="p-5 border-b border-slate-800 text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">Loading team...</td>
                            </tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">No members found.</td>
                            </tr>
                        ) : (
                            filteredMembers.map(member => (
                                <tr key={member.id} className="hover:bg-slate-800/30 group transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                                    className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-slate-700"
                                                />
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${member.status === 'online' ? 'bg-green-500' :
                                                        member.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{member.name}</p>
                                                <p className="text-xs text-slate-400">ID: {member.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white capitalize ${member.status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                member.status === 'busy' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-slate-700/50 text-slate-400 border border-slate-700'
                                            }`}>
                                            <Circle size={8} fill="currentColor" className={member.status === 'online' ? 'animate-pulse' : ''} />
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {editingId === member.id ? (
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-white focus:border-primary focus:outline-none"
                                                autoFocus
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {member.role === 'admin' && <Shield size={14} className="text-yellow-500" />}
                                                <span className={`capitalize ${member.role === 'admin' ? 'text-yellow-500 font-bold' : 'text-slate-300'}`}>
                                                    {member.role}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    {currentUserRole === 'admin' && (
                                        <td className="p-5 text-right">
                                            {editingId === member.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveRole(member.id)}
                                                        className="p-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600 hover:text-white transition-colors"
                                                        title="Save"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600 hover:text-white transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(member)}
                                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                                    title="Edit Permissions"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && currentUserRole !== 'admin' && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                    <Shield className="text-yellow-500" size={20} />
                    <p className="text-yellow-200 text-sm">Role management is restricted to Administrators only.</p>
                </div>
            )}
        </div>
    );
};

export default Contacts;
