import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Briefcase } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'revenue' | 'task' | 'investment'>('revenue');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'of' | 'telegram' | 'fansly'>('of');
  const [category, setCategory] = useState<string>('editing');
  const [taskType, setTaskType] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSaving, setIsSaving] = useState(false);

  const investmentCategories = [
    { id: 'editing', label: 'Editing' },
    { id: 'transport', label: 'Transport' },
    { id: 'travel', label: 'Travel' },
    { id: 'airbnb', label: 'Airbnb' },
    { id: 'personnel', label: 'Personnel' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'revenue' || mode === 'investment') document.getElementById('amount-input')?.focus();
      else document.getElementById('task-input')?.focus();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (mode === 'revenue') {
        if (!amount) return;
        const numAmount = parseFloat(amount);
        const today = new Date().toISOString().split('T')[0];

        // 1. Insert into Transactions
        const { error: txError } = await supabase.from('transactions').insert({
          amount: numAmount, // Positive for income
          platform,
          type: 'income',
          description: `Manual Entry (${platform})`,
        });
        if (txError) throw txError;

        // 2. Update Daily Revenue
        const { data: existingDay } = await supabase.from('revenue_daily').select('amount').eq('date', today).single();
        const currentTotal = existingDay ? Number(existingDay.amount) : 0;
        const { error: revError } = await supabase.from('revenue_daily').upsert({
          date: today,
          amount: currentTotal + numAmount
        }, { onConflict: 'date' });
        if (revError) throw revError;

      } else if (mode === 'investment') {
        if (!amount) return;
        const numAmount = parseFloat(amount);

        // Insert Expense
        // Use category as platform so it shows up in the UI list properly
        const { error: txError } = await supabase.from('transactions').insert({
          amount: -numAmount,
          type: 'expense',
          category: category,
          description: description || `Investment: ${category}`,
          platform: category // Saving category as platform for display compatibility
        });
        if (txError) throw txError;

      } else {
        // Task Mode
        if (!description) return;
        const { error } = await supabase.from('tasks').insert({
          text: description,
          type: taskType,
          due_date: new Date().toISOString(),
          is_completed: false
        });
        if (error) throw error;
      }

      if (onSuccess) onSuccess();
      // Reset fields
      setAmount('');
      setDescription('');
      onClose();

    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Ensure database schema is updated.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header with Tabs */}
        <div className="bg-slate-800/50 flex border-b border-slate-700">
          <button
            type="button"
            onClick={() => setMode('revenue')}
            className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'revenue' ? 'text-white border-b-2 border-green-500 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <DollarSign size={18} className={mode === 'revenue' ? 'text-green-500' : ''} />
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setMode('investment')}
            className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'investment' ? 'text-white border-b-2 border-red-500 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Briefcase size={18} className={mode === 'investment' ? 'text-red-500' : ''} />
            Investment
          </button>
          <button
            type="button"
            onClick={() => setMode('task')}
            className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'task' ? 'text-white border-b-2 border-blue-500 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Check size={18} className={mode === 'task' ? 'text-blue-500' : ''} />
            Task
          </button>
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {mode === 'revenue' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl font-light">$</span>
                  <input
                    id="amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['of', 'telegram', 'fansly'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`py-3 px-2 rounded-lg border text-sm font-medium capitalize transition-all ${platform === p
                        ? 'bg-green-500/20 border-green-500 text-green-500'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                      {p === 'of' ? 'OnlyFans' : p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'investment' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl font-light">$</span>
                  <input
                    id="amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {investmentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-2 rounded-lg border text-sm font-medium capitalize transition-all ${category === cat.id
                        ? 'bg-red-500/20 border-red-500 text-red-500'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-700"
                />
              </div>
            </>
          )}

          {mode === 'task' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Task Description</label>
                <input
                  id="task-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Reply to VIPs"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskType(p)}
                      className={`py-3 px-2 rounded-lg border text-sm font-medium capitalize transition-all ${taskType === p
                        ? p === 'high' ? 'bg-red-500/20 border-red-500 text-red-500' : p === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-blue-500/20 border-blue-500 text-blue-500'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isSaving
              ? 'bg-slate-700 cursor-wait'
              : mode === 'revenue' ? 'bg-green-600 hover:bg-green-500'
                : mode === 'investment' ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
          >
            {isSaving ? 'Saving...' : (
              <>
                <Check size={20} />
                {mode === 'revenue' ? 'Record Income' : mode === 'investment' ? 'Record Expense' : 'Create Task'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
