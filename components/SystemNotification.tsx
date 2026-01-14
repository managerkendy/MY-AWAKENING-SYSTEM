import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SystemNotificationProps {
  message: string;
  subtext?: string;
  type: 'LEVEL_UP' | 'QUEST_COMPLETE' | 'INFO';
  onClose: () => void;
}

export const SystemNotification: React.FC<SystemNotificationProps> = ({ message, subtext, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Wait for fade out animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getColor = () => {
    switch (type) {
      case 'LEVEL_UP': return 'border-system-gold shadow-[0_0_30px_rgba(255,215,0,0.4)] bg-black/90';
      case 'QUEST_COMPLETE': return 'border-system-blue shadow-[0_0_30px_rgba(0,240,255,0.4)] bg-black/90';
      default: return 'border-gray-500 bg-gray-900';
    }
  };

  return (
    <div 
      className={`
        fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      `}
    >
      <div className={`
        min-w-[300px] p-6 rounded-lg border-2 text-center
        ${getColor()}
      `}>
        <div className="font-orbitron font-bold text-2xl text-white mb-2 tracking-widest uppercase">
          {type.replace('_', ' ')}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4 opacity-50"></div>
        <div className="font-rajdhani text-xl text-white font-semibold mb-1">
          {message}
        </div>
        {subtext && (
          <div className="font-mono text-sm text-gray-400">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
