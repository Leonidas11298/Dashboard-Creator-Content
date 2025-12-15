import React, { useState, useEffect } from 'react';
import { X, Check, Target } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [target, setTarget] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.getElementById('target-input')?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target) return;

        setIsSaving(true);
        try {
            const numTarget = parseFloat(target);

            // Deactivate old goals (optional, but good practice)
            await supabase.from('goals').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all

            // Insert new goal
            const { error } = await supabase.from('goals').insert({
                target_amount: numTarget,
                is_active: true
            });

            if (error) throw error;

            if (onSuccess) onSuccess();
            setTarget('');
            onClose();

        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Failed to save goal.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="bg-slate-800/50 p-4 flex items-center justify-between border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="text-violet-400" size={20} />
                        Set Monthly Goal
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Target Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl font-light">$</span>
                            <input
                                id="target-input"
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="10000"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-700"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500">This will update your progress bar immediately.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isSaving
                                ? 'bg-violet-600/50 cursor-wait'
                                : 'bg-violet-600 hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isSaving ? (
                            'Setting Goal...'
                        ) : (
                            <>
                                <Check size={20} />
                                Set Goal
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GoalModal;
