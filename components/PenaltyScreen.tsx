import React, { useEffect, useState } from 'react';
import { AlertTriangle, WifiOff, Clock } from 'lucide-react';

interface PenaltyScreenProps {
  expiresAt: number;
}

export const PenaltyScreen: React.FC<PenaltyScreenProps> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        // In a real app, we might trigger a reload here, 
        // but the parent component handles state updates.
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-system-danger overflow-hidden font-orbitron">
      {/* Glitch Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-overlay pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8 border-4 border-system-danger bg-black/90 max-w-2xl w-full mx-4 shadow-[0_0_50px_rgba(255,42,42,0.5)] animate-pulse-fast">
        
        <div className="flex items-center gap-4 text-6xl md:text-8xl font-black tracking-tighter glitch-text">
          <AlertTriangle className="w-20 h-20 md:w-32 md:h-32" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] text-system-danger drop-shadow-[0_0_10px_rgba(255,42,42,0.8)]">
            PENALTY ZONE
          </h1>
          <h2 className="text-2xl md:text-3xl text-white font-rajdhani uppercase tracking-widest border-t border-b border-system-danger py-2">
             Failure to Complete Daily Tasks
          </h2>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
           <WifiOff className="w-16 h-16 text-gray-500" />
           <p className="text-xl text-gray-400 font-mono text-center">
             SYSTEM CONNECTION SEVERED.<br/>
             INTERNET ACCESS RESTRICTED.
           </p>
        </div>

        <div className="mt-12 flex items-center gap-4 bg-system-danger/10 px-8 py-4 rounded border border-system-danger/50">
           <Clock className="w-8 h-8 animate-spin" />
           <div className="flex flex-col">
             <span className="text-xs uppercase tracking-widest text-system-danger/70">Penalty Duration</span>
             <span className="text-4xl font-mono font-bold text-white">{timeLeft}</span>
           </div>
        </div>
      </div>
      
      {/* Background Scanlines */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};
