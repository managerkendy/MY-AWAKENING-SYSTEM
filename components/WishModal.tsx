import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface WishModalProps {
  onClose: () => void;
  onConfirm: (wishText: string) => void;
  isLoading: boolean;
}

export const WishModal: React.FC<WishModalProps> = ({ onClose, onConfirm, isLoading }) => {
  const [wish, setWish] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wish.trim()) {
      onConfirm(wish);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#0a0f1e] border-2 border-system-gold rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.2)] relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-system-gold/30 bg-gradient-to-r from-yellow-900/20 to-transparent">
          <h2 className="text-3xl font-orbitron font-bold text-system-gold text-center tracking-widest uppercase drop-shadow-md">
            Hidden Reward
          </h2>
          <p className="text-center text-yellow-200/70 font-rajdhani mt-2 uppercase tracking-wide text-sm">
            Daily Tasks Complete. State your desire.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-8">
                <label className="block text-system-blue font-mono text-xs mb-2 tracking-widest">INPUT COMMAND:</label>
                <textarea
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="I wish for..."
                    className="w-full h-32 bg-black/50 border border-system-gold/50 rounded p-4 text-white font-rajdhani text-lg focus:outline-none focus:border-system-gold focus:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all resize-none placeholder-gray-600"
                    autoFocus
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 py-3 border border-gray-600 text-gray-400 font-orbitron rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    CANCEL
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !wish.trim()}
                    className="flex-1 py-3 bg-system-gold text-black font-orbitron font-bold rounded hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    GRANT WISH
                </button>
            </div>
        </form>

        {/* Decorative Particles */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-gold to-transparent opacity-80"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-system-gold opacity-50"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-system-gold opacity-50"></div>
      </div>
    </div>
  );
};
