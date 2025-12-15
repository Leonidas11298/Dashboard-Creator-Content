import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { User, Lock, Globe, Bell, Shield, Save, Moon, Sun } from 'lucide-react';

const Settings = ({ currentUserId }: { currentUserId: string | null }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Preferences State
    const [language, setLanguage] = useState<'en' | 'es'>('en'); // Default to English
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        if (currentUserId) fetchProfile();
    }, [currentUserId]);

    const fetchProfile = async () => {
        try {
            // Get Auth Data
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
            }

            // Get Public Profile Data
            const { data: profile } = await supabase
                .from('team_members')
                .select('*')
                .eq('user_id', currentUserId)
                .single();

            if (profile) {
                setFullName(profile.name);
                setAvatarUrl(profile.avatar_url || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUserId) return;
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('team_members')
                .update({
                    name: fullName,
                    avatar_url: avatarUrl
                })
                .eq('user_id', currentUserId);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) return;
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
        }
        setLoading(false);
    };

    return (
        <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
            <p className="text-slate-400 mb-8">Manage your account preferences and workspace settings.</p>

            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Profile Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <User className="text-primary" size={20} /> My Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                            <input
                                type="text"
                                value={email}
                                disabled
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avatar URL</label>
                            <div className="flex gap-4">
                                <img src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName}`} className="w-12 h-12 rounded-full hidden md:block" />
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-primary hover:bg-violet-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </section>

                {/* 2. App Preferences */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="text-blue-500" size={20} /> Application Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Globe size={20} /></div>
                                <div>
                                    <div className="text-white font-medium">Language</div>
                                    <div className="text-xs text-slate-500">Choose your interface language</div>
                                </div>
                            </div>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'en' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'es' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Español
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Moon size={20} /></div>
                                <div>
                                    <div className="text-white font-medium">Theme</div>
                                    <div className="text-xs text-slate-500">Customize the look and feel</div>
                                </div>
                            </div>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${theme === 'dark' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Dark
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${theme === 'light' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Light
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Security */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="text-green-500" size={20} /> Security
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Password</p>
                            <p className="text-sm text-slate-500">Secure your account with a strong password.</p>
                        </div>
                        <button
                            onClick={handlePasswordReset}
                            disabled={loading}
                            className="border border-slate-700 hover:border-slate-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </section>

                {/* 4. Danger Zone */}
                <section className="border border-red-900/30 bg-red-950/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                        <Shield size={20} /> Danger Zone
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-200 font-medium">Delete Account</p>
                            <p className="text-sm text-red-300/60">Permanently remove your account and all data.</p>
                        </div>
                        <button className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm transition-colors">
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
