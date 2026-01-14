import React from 'react';
import { PlayerStats, StatType } from '../types';
import { Shield, Zap, TrendingUp, Activity, Brain, Eye, Plus, Dumbbell, BookOpen, Heart, ClipboardList } from 'lucide-react';

interface StatusPanelProps {
  player: PlayerStats;
  onIncreaseStat: (stat: StatType) => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ player, onIncreaseStat }) => {
  const getStatIcon = (stat: StatType) => {
    switch (stat) {
      case StatType.PHYSICAL: return <Dumbbell className="w-5 h-5 text-red-400" />;
      case StatType.KNOWLEDGE: return <BookOpen className="w-5 h-5 text-blue-400" />;
      case StatType.WELLNESS: return <Heart className="w-5 h-5 text-green-400" />;
      case StatType.ROUTINE: return <ClipboardList className="w-5 h-5 text-yellow-400" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const xpPercentage = Math.min((player.currentXp / player.requiredXp) * 100, 100);
  const hpPercentage = (player.hp / player.maxHp) * 100;
  const mpPercentage = (player.mp / player.maxMp) * 100;

  return (
    <div className="bg-system-panel border-2 border-system-border/50 p-6 rounded-lg relative overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(0,168,204,0.2)]">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-system-border/30 pb-4 mb-6">
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-white tracking-widest uppercase">
            REPORT
          </h2>
          <div className="text-system-blue text-sm font-rajdhani font-semibold tracking-wider">
             ACTIVITY LOG
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-orbitron font-bold text-white leading-none">LVL.{player.level}</div>
          <div className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{player.job}</div>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-4 mb-8 font-rajdhani font-semibold">
        {/* HP */}
        <div className="col-span-1">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>HP</span>
                <span>{player.hp}/{player.maxHp}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-sm overflow-hidden">
                <div 
                className="h-full bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.6)]"
                style={{ width: `${hpPercentage}%` }}
                />
            </div>
        </div>

        {/* MP */}
        <div className="col-span-1">
             <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>MP</span>
                <span>{player.mp}/{player.maxMp}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-sm overflow-hidden">
                <div 
                className="h-full bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.6)]"
                style={{ width: `${mpPercentage}%` }}
                />
            </div>
        </div>
        
        {/* XP */}
        <div className="col-span-2 mt-2">
             <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>EXP PROGRESS</span>
                <span>{Math.floor(xpPercentage)}%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-sm overflow-hidden">
                <div 
                className="h-full bg-system-gold shadow-[0_0_5px_rgba(255,215,0,0.5)]"
                style={{ width: `${xpPercentage}%` }}
                />
            </div>
        </div>
      </div>

      {/* Activity Report List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">
            Performance Metrics
        </h3>
        {Object.values(StatType).map((stat) => (
          <div key={stat} className="flex items-center justify-between bg-black/40 p-3 rounded border border-gray-800/50 hover:border-system-blue/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-full border border-gray-700">
                {getStatIcon(stat)}
              </div>
              <div>
                  <div className="font-orbitron text-gray-200 tracking-wide text-xs uppercase text-system-blue/80">Category</div>
                  <div className="font-rajdhani font-bold text-white text-sm">{stat}</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="font-mono text-2xl text-white font-bold leading-none">{player.stats[stat]}</span>
               <span className="text-[10px] text-gray-500 uppercase tracking-wide">Completed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned Points (Hidden or repurposed as generic bonus indicator) */}
      {player.unassignedPoints > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 animate-pulse text-system-gold font-orbitron text-xs">
          <TrendingUp className="w-4 h-4" />
          <span>BONUS REWARDS AVAILABLE: {player.unassignedPoints}</span>
        </div>
      )}
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-blue"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-blue"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-system-blue"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-blue"></div>
    </div>
  );
};