import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState<'of' | 'telegram' | 'fansly'>('of');
  const [isSaving, setIsSaving] = useState(false);

  // Focus trap and escape key handling could go here
  useEffect(() => {
    if (isOpen) {
        document.getElementById('amount-input')?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setAmount('');
      onClose();
    }, 600);
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
            <DollarSign className="text-green-400" size={20} />
            Quick Revenue Entry
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-700"
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
                  className={`py-3 px-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                    platform === p
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p === 'of' ? 'OnlyFans' : p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              isSaving 
                ? 'bg-green-600/50 cursor-wait' 
                : 'bg-green-600 hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSaving ? (
              'Processing...'
            ) : (
              <>
                <Check size={20} />
                Record Transaction
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
