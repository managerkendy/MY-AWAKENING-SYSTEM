import React, { useState, useEffect, useCallback } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { QuestPanel } from './components/QuestPanel';
import { SystemChat } from './components/SystemChat';
import { SystemNotification } from './components/SystemNotification';
import { WishModal } from './components/WishModal';
import { PenaltyScreen } from './components/PenaltyScreen';
import { PlayerStats, Quest, ChatMessage, StatType, QuestDifficulty } from './types';
import { INITIAL_PLAYER_STATS, LEVEL_SCALING_FACTOR } from './constants';
import { generateDailyQuests, chatWithSystem, evaluateWish } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [player, setPlayer] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Add penalty fields if missing
        if (parsed.penaltyActive === undefined) {
             return { ...parsed, penaltyActive: false, penaltyExpires: 0, lastActiveDate: new Date().toDateString() };
        }
        return parsed;
    }
    return INITIAL_PLAYER_STATS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('quests');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
     const saved = localStorage.getItem('chatHistory');
     return saved ? JSON.parse(saved) : [
       { id: 'init', sender: 'SYSTEM', text: 'SYSTEM INITIALIZED.\nWelcome, Player. Daily tasks are ready.', timestamp: Date.now() }
     ];
  });

  const [notification, setNotification] = useState<{message: string, subtext?: string, type: 'LEVEL_UP' | 'QUEST_COMPLETE' | 'INFO'} | 'PENALTY' | null>(null);
  const [isGeneratingQuests, setIsGeneratingQuests] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Wish State
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [isProcessingWish, setIsProcessingWish] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem('quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // --- Daily Reset & Penalty Check Logic ---
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastDate = player.lastActiveDate || new Date().toDateString();

      // Check if day has changed
      if (today !== lastDate) {
        console.log("New Day Detected. Checking status...");
        
        const allCompleted = quests.length > 0 && quests.every(q => q.isCompleted);
        const hadQuests = quests.length > 0;

        if (hadQuests && !allCompleted) {
            // FAILURE: SYSTEM RESET
            console.log("Daily failure: Resetting system...");
            
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // Full Reset to Initial Stats, but apply Penalty
            const resetState: PlayerStats = {
                ...INITIAL_PLAYER_STATS,
                penaltyActive: true,
                penaltyExpires: endOfDay.getTime(),
                lastActiveDate: today
            };

            setPlayer(resetState);
            setQuests([]); 
            
            // Wipe Chat and show System Fail Message
            setChatMessages([{
                id: crypto.randomUUID(),
                sender: 'SYSTEM',
                text: 'CRITICAL FAILURE DETECTED.\nDaily tasks incomplete.\nSYSTEM RESET INITIATED.\nPENALTY ZONE ACTIVE.',
                timestamp: Date.now()
            }]);

        } else {
            // SUCCESS or No Previous Quests (Normal rollover)
            setPlayer(prev => ({
                ...prev,
                lastActiveDate: today,
                penaltyActive: false,
                penaltyExpires: 0
            }));
            setQuests([]); // Clear old completed quests
            
            if (hadQuests) {
                setChatMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    sender: 'SYSTEM',
                    text: 'Cycle complete. Daily tasks refreshed.',
                    timestamp: Date.now()
                }]);
            }
        }
      } else {
        // Same day check: If penalty is active but expired, clear it
        if (player.penaltyActive && Date.now() > player.penaltyExpires) {
             setPlayer(prev => ({ ...prev, penaltyActive: false, penaltyExpires: 0 }));
        }
      }
    };

    checkDailyReset();
    // Run check every minute in case the app is left open across midnight
    const interval = setInterval(checkDailyReset, 60000); 
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run effect on mount/interval, depend on refs inside if needed or just minimal deps

  // --- Logic ---

  const handleRefreshQuests = useCallback(async () => {
    // If penalty is active, do not generate quests
    if (player.penaltyActive) return;

    setIsGeneratingQuests(true);
    const newQuests = await generateDailyQuests(player);
    setQuests(newQuests);
    setIsGeneratingQuests(false);
    
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'SYSTEM',
      text: 'NOTICE: Daily tasks have been refreshed.',
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, msg]);
  }, [player]);

  // Initial Quest Generation
  useEffect(() => {
    // Generate if empty AND not in penalty
    if (quests.length === 0 && !player.penaltyActive) {
      handleRefreshQuests();
    }
  }, [quests.length, player.penaltyActive, handleRefreshQuests]); 

  // Standard Level Up Calculation (XP Based) - Kept for secondary progression if needed
  // BUT user requested "level will go up when all daily task is finished"
  // We will keep this for XP overflow but the main trigger is now task completion
  const checkXpLevelUp = (currentStats: PlayerStats) => {
    if (currentStats.currentXp >= currentStats.requiredXp) {
       // ... Logic remains, but maybe we don't use it for the main Level Up anymore?
       // Let's leave XP as a progress bar that might give bonus stats, 
       // but strictly follow user request for Level Up on completion.
       // Actually, let's keep XP as a sub-mechanic.
    }
  };

  const handleCompleteQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    // 1. Update Quest State
    const updatedQuests = quests.map(q => q.id === questId ? { ...q, isCompleted: true } : q);
    setQuests(updatedQuests);

    // 2. Check for ALL Completed (Trigger Level Up)
    const allNowCompleted = updatedQuests.every(q => q.isCompleted);

    // 3. Update Player Stats (Add Report Counter, XP, Gold)
    const currentStatValue = player.stats[quest.statCategory] || 0;
    
    // Calculate new Level
    // If all completed, Level + 1 immediately
    const newLevel = allNowCompleted ? player.level + 1 : player.level;

    const updatedPlayer = {
      ...player,
      level: newLevel,
      currentXp: player.currentXp + quest.rewardXp, // Still track XP for fun
      gold: player.gold + quest.rewardGold,
      stats: {
        ...player.stats,
        [quest.statCategory]: currentStatValue + 1
      },
      // If we leveled up, maybe heal?
      hp: allNowCompleted ? player.maxHp + 10 : player.hp, 
      maxHp: allNowCompleted ? player.maxHp + 10 : player.maxHp,
      mp: allNowCompleted ? player.maxMp + 5 : player.mp,
      maxMp: allNowCompleted ? player.maxMp + 5 : player.maxMp,
    };

    setPlayer(updatedPlayer);

    // 4. Notifications
    if (allNowCompleted) {
        setNotification({
            type: 'LEVEL_UP',
            message: 'DAILY QUESTS COMPLETE',
            subtext: `LEVEL UP! You are now Level ${newLevel}`
        });
        // Add chat log
        setChatMessages(prev => [...prev, {
             id: crypto.randomUUID(),
             sender: 'SYSTEM',
             text: `[SYSTEM] ALL DAILY TASKS COMPLETE. LEVEL INCREASED TO ${newLevel}.`,
             timestamp: Date.now()
        }]);
    } else {
        setNotification({
            type: 'QUEST_COMPLETE',
            message: 'TASK COMPLETE',
            subtext: `+1 ${quest.statCategory}`
        });
    }
  };

  const handleUpdateQuest = (updatedQuest: Quest) => {
    setQuests(prev => prev.map(q => q.id === updatedQuest.id ? updatedQuest : q));
  };

  const handleAddQuest = () => {
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title: "New Custom Task",
      description: "Define your own path.",
      difficulty: QuestDifficulty.E,
      rewardXp: 10,
      rewardGold: 0,
      isCompleted: false,
      type: 'DAILY',
      statCategory: StatType.ROUTINE,
      subtasks: []
    };
    // Add to top of list
    setQuests(prev => [newQuest, ...prev]);
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests(prev => prev.filter(q => q.id !== questId));
  };

  const handleIncreaseStat = (stat: StatType) => {
    // Legacy stat increase logic
  };

  const handleMakeWish = async (wishText: string) => {
    setIsProcessingWish(true);
    const result = await evaluateWish(wishText, player);
    
    // Apply Rewards
    let updatedPlayer = { ...player };
    
    if (result.rewardType === 'XP') {
      updatedPlayer.currentXp += result.rewardValue;
    } else if (result.rewardType === 'GOLD') {
      updatedPlayer.gold += result.rewardValue;
    } else if (result.rewardType === 'STAT' && result.statTarget) {
      updatedPlayer.stats = {
        ...updatedPlayer.stats,
        [result.statTarget]: (updatedPlayer.stats[result.statTarget] || 0) + result.rewardValue
      };
    } else if (result.rewardType === 'HEAL') {
      updatedPlayer.hp = updatedPlayer.maxHp;
      updatedPlayer.mp = updatedPlayer.maxMp;
    } else if (result.rewardType === 'PENALTY') {
       updatedPlayer.gold = Math.max(0, updatedPlayer.gold - 10);
    }

    setPlayer(updatedPlayer);
    
    setNotification({
        type: 'INFO',
        message: 'WISH GRANTED',
        subtext: result.message
    });
    
    setChatMessages(prev => [
        ...prev, 
        { id: crypto.randomUUID(), sender: 'USER', text: `[WISH] ${wishText}`, timestamp: Date.now() },
        { id: crypto.randomUUID(), sender: 'SYSTEM', text: `[GRANT] ${result.message}`, timestamp: Date.now() }
    ]);

    setIsProcessingWish(false);
    setIsWishModalOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'USER',
      text: text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    const context = `Level: ${player.level}, Class: ${player.job}, Title: ${player.title}, Activity Report: ${JSON.stringify(player.stats)}`;
    const responseText = await chatWithSystem(text, context);

    const systemMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'SYSTEM',
      text: responseText,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, systemMsg]);
    setIsChatLoading(false);
  };

  // --- Render ---

  // Check Penalty State
  if (player.penaltyActive) {
      // Check if expired just in case (though useEffect handles it)
      if (Date.now() < player.penaltyExpires) {
          return <PenaltyScreen expiresAt={player.penaltyExpires} />;
      }
  }

  return (
    <div className="min-h-screen bg-system-dark text-gray-200 selection:bg-system-blue selection:text-black font-rajdhani relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-system-dark to-system-dark"></div>
      <div className="fixed top-0 w-full h-1 bg-gradient-to-r from-transparent via-system-blue to-transparent opacity-50 z-50"></div>
      
      {/* Notification Overlay */}
      {notification && typeof notification !== 'string' && (
        <SystemNotification 
          {...notification as any} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      {/* Wish Modal */}
      {isWishModalOpen && (
          <WishModal 
            onClose={() => setIsWishModalOpen(false)}
            onConfirm={handleMakeWish}
            isLoading={isProcessingWish}
          />
      )}

      {/* Main Container */}
      <div className="relative z-10 container mx-auto p-4 md:p-8 md:h-screen min-h-screen flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <h1 className="text-xl font-orbitron text-system-blue tracking-widest animate-pulse">SYSTEM AWAKENING</h1>
            <div className="text-xs font-mono text-gray-500">SERVER: ONLINE | LATENCY: 12ms</div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 md:overflow-hidden min-h-0">
          
          {/* Left Column: Stats */}
          {/* Mobile: Auto height. Desktop: Full height scrollable. */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col md:h-full md:overflow-y-auto">
            <StatusPanel player={player} onIncreaseStat={handleIncreaseStat} />
          </div>

          {/* Middle Column: Quests */}
          {/* Mobile: Fixed height (500px) to allow internal scrolling. Desktop: Full height (hidden overflow handled by child). */}
          <div className="md:col-span-8 lg:col-span-5 flex flex-col h-[500px] md:h-full overflow-hidden">
             <QuestPanel 
                quests={quests} 
                onCompleteQuest={handleCompleteQuest} 
                onUpdateQuest={handleUpdateQuest}
                onRefreshQuests={handleRefreshQuests}
                onAddQuest={handleAddQuest}
                onDeleteQuest={handleDeleteQuest}
                onOpenWish={() => setIsWishModalOpen(true)}
                isGenerating={isGeneratingQuests}
             />
          </div>

          {/* Right Column: Chat */}
          {/* Mobile: Fixed height. Desktop: Full height. */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col h-[400px] lg:h-full">
            <SystemChat 
              messages={chatMessages} 
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;