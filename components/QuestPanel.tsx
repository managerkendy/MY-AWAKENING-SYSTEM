import React, { useState } from 'react';
import { Quest, QuestDifficulty, Subtask, StatType } from '../types';
import { Check, Circle, AlertTriangle, RefreshCcw, Loader2, Sparkles, Pencil, Save, X, Plus, Trash2 } from 'lucide-react';

interface QuestPanelProps {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onUpdateQuest: (quest: Quest) => void;
  onRefreshQuests: () => void;
  onAddQuest: () => void;
  onDeleteQuest: (id: string) => void;
  onOpenWish: () => void;
  isGenerating: boolean;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ quests, onCompleteQuest, onUpdateQuest, onRefreshQuests, onAddQuest, onDeleteQuest, onOpenWish, isGenerating }) => {
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  
  // Temporary state for editing
  const [editForm, setEditForm] = useState<Partial<Quest>>({});

  const startEditing = (quest: Quest) => {
    setEditingQuestId(quest.id);
    setEditForm(JSON.parse(JSON.stringify(quest))); // Deep copy
  };

  const cancelEditing = () => {
    setEditingQuestId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingQuestId && editForm.id) {
        onUpdateQuest(editForm as Quest);
        setEditingQuestId(null);
        setEditForm({});
    }
  };

  const handleSubtaskToggle = (quest: Quest, subtask: Subtask) => {
    if (quest.isCompleted) return;

    const updatedSubtasks = quest.subtasks?.map(st => 
        st.id === subtask.id ? { ...st, isCompleted: !st.isCompleted } : st
    ) || [];

    const updatedQuest = { ...quest, subtasks: updatedSubtasks };
    
    // Check if all subtasks are now complete
    const allSubtasksDone = updatedSubtasks.every(st => st.isCompleted);
    if (allSubtasksDone && updatedSubtasks.length > 0) {
        // Automatically complete the main quest if all subtasks are done
        onCompleteQuest(quest.id);
        onUpdateQuest(updatedQuest); 
    } else {
        onUpdateQuest(updatedQuest);
    }
  };

  const addSubtaskInEdit = () => {
      const newSubtask: Subtask = {
          id: crypto.randomUUID(),
          text: '',
          isCompleted: false
      };
      setEditForm(prev => ({
          ...prev,
          subtasks: [...(prev.subtasks || []), newSubtask]
      }));
  };

  const updateSubtaskInEdit = (id: string, text: string) => {
      setEditForm(prev => ({
          ...prev,
          subtasks: prev.subtasks?.map(st => st.id === id ? { ...st, text } : st)
      }));
  };

  const removeSubtaskInEdit = (id: string) => {
      setEditForm(prev => ({
          ...prev,
          subtasks: prev.subtasks?.filter(st => st.id !== id)
      }));
  };

  const getDifficultyColor = (diff: QuestDifficulty) => {
    switch(diff) {
      case QuestDifficulty.E: return 'text-gray-400 border-gray-400';
      case QuestDifficulty.D: return 'text-green-400 border-green-400';
      case QuestDifficulty.C: return 'text-blue-400 border-blue-400';
      case QuestDifficulty.B: return 'text-purple-400 border-purple-400';
      case QuestDifficulty.A: return 'text-red-400 border-red-400';
      case QuestDifficulty.S: return 'text-system-gold border-system-gold shadow-[0_0_10px_gold]';
      default: return 'text-gray-400';
    }
  };

  const allCompleted = quests.length > 0 && quests.every(q => q.isCompleted);

  return (
    <div className={`flex flex-col h-full bg-system-panel border-2 p-6 rounded-lg backdrop-blur-sm relative transition-all duration-500 ${allCompleted ? 'border-system-gold shadow-[0_0_30px_rgba(255,215,0,0.2)]' : 'border-system-border/50 shadow-[0_0_20px_rgba(0,168,204,0.2)]'}`}>
      
      <div className="flex justify-between items-center mb-6 border-b border-system-border/30 pb-4">
        <h2 className={`text-2xl font-orbitron font-bold flex items-center gap-2 ${allCompleted ? 'text-system-gold' : 'text-white'}`}>
          {allCompleted ? <Sparkles className="text-system-gold animate-pulse" /> : <AlertTriangle className="text-system-blue" />}
          {allCompleted ? 'TASKS COMPLETE' : 'DAILY TASKS'}
        </h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={onAddQuest}
                className="p-2 text-system-blue hover:text-white hover:bg-system-blue/20 rounded-full transition-all border border-transparent hover:border-system-blue/50"
                title="Add Custom Task"
            >
                <Plus className="w-5 h-5" />
            </button>
            <button 
                onClick={onRefreshQuests}
                disabled={isGenerating}
                className="p-2 text-system-blue hover:text-white hover:bg-system-blue/20 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-system-blue/50"
                title="Refresh Daily Tasks"
            >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {quests.length === 0 && !isGenerating && (
          <div className="text-center text-gray-500 py-10 font-rajdhani text-lg">
            NO ACTIVE TASKS.
            <br />
            <span className="text-xs">System waiting for generation...</span>
          </div>
        )}

        {quests.map((quest) => (
          <div 
            key={quest.id}
            className={`
              relative p-4 border border-gray-700 bg-gray-900/50 rounded transition-all duration-300 group
              ${quest.isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}
              ${editingQuestId === quest.id ? 'border-system-blue bg-gray-900 z-10' : 'hover:bg-gray-800/80'}
            `}
          >
             {editingQuestId === quest.id ? (
                // EDIT MODE
                <div className="flex flex-col gap-3">
                    <input 
                        className="bg-black/40 border border-gray-600 rounded p-2 text-white font-orbitron text-lg focus:border-system-blue outline-none"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        placeholder="Quest Title"
                    />
                    <textarea 
                        className="bg-black/40 border border-gray-600 rounded p-2 text-gray-300 font-rajdhani text-sm focus:border-system-blue outline-none resize-none"
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        placeholder="Description"
                        rows={2}
                    />

                    <div className="flex gap-2">
                        <select 
                            className="flex-1 bg-black/40 border border-gray-600 rounded p-2 text-xs text-gray-300 focus:border-system-blue outline-none"
                            value={editForm.difficulty}
                            onChange={(e) => setEditForm({...editForm, difficulty: e.target.value as QuestDifficulty})}
                        >
                            {Object.values(QuestDifficulty).map(d => (
                                <option key={d} value={d}>Rank {d}</option>
                            ))}
                        </select>
                        <select 
                             className="flex-1 bg-black/40 border border-gray-600 rounded p-2 text-xs text-gray-300 focus:border-system-blue outline-none"
                             value={editForm.statCategory}
                             onChange={(e) => setEditForm({...editForm, statCategory: e.target.value as StatType})}
                        >
                            {Object.values(StatType).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Subtasks Edit */}
                    <div className="space-y-2 mt-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Subtasks</label>
                        {editForm.subtasks?.map((st) => (
                            <div key={st.id} className="flex gap-2">
                                <input 
                                    className="flex-1 bg-black/40 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:border-system-blue outline-none"
                                    value={st.text}
                                    onChange={(e) => updateSubtaskInEdit(st.id, e.target.value)}
                                    placeholder="Subtask description"
                                />
                                <button 
                                    onClick={() => removeSubtaskInEdit(st.id)}
                                    className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={addSubtaskInEdit}
                            className="flex items-center gap-1 text-xs text-system-blue hover:text-white mt-1"
                        >
                            <Plus className="w-3 h-3" /> Add Subtask
                        </button>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
                         <button 
                            onClick={() => onDeleteQuest(quest.id)} 
                            className="p-2 text-red-500 hover:bg-red-900/20 rounded flex items-center gap-2 text-xs font-mono"
                        >
                            <Trash2 className="w-4 h-4" /> DELETE
                        </button>

                        <div className="flex gap-2">
                            <button onClick={cancelEditing} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                                <X className="w-5 h-5" />
                            </button>
                            <button onClick={saveEditing} className="p-2 text-system-blue hover:bg-system-blue/20 rounded">
                                <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
             ) : (
                // VIEW MODE
                <>
                    {/* Difficulty Badge */}
                    <div className={`
                    absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 border-2 font-bold font-orbitron text-sm z-10
                    ${getDifficultyColor(quest.difficulty)}
                    `}>
                        {quest.difficulty}
                    </div>

                    {/* Edit Button */}
                    {!quest.isCompleted && (
                        <button 
                            onClick={() => startEditing(quest)}
                            className="absolute top-2 right-8 p-1.5 text-gray-600 hover:text-system-blue opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}

                    <div className="flex items-start gap-4">
                        {/* Main Checkbox */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => !quest.isCompleted && (!quest.subtasks?.length || quest.subtasks.every(s => s.isCompleted)) && onCompleteQuest(quest.id)}
                                className={`
                                    mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                                    ${quest.isCompleted 
                                    ? 'bg-system-blue border-system-blue text-black' 
                                    : (quest.subtasks?.length && quest.subtasks.length > 0 && !quest.subtasks.every(s => s.isCompleted))
                                        ? 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50' // Disabled if incomplete subtasks
                                        : 'border-gray-500 hover:border-system-blue text-transparent'
                                    }
                                `}
                                disabled={quest.isCompleted || (!!quest.subtasks?.length && !quest.subtasks.every(s => s.isCompleted))}
                                title={quest.subtasks?.length ? "Complete all subtasks first" : "Complete Quest"}
                            >
                                <Check className="w-4 h-4" strokeWidth={4} />
                            </button>
                            {/* Vertical line connecting to subtasks if they exist */}
                            {quest.subtasks && quest.subtasks.length > 0 && (
                                <div className="w-px h-full bg-gray-700 my-2"></div>
                            )}
                        </div>
                        
                        <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between">
                                <h3 className={`font-orbitron text-lg text-white mb-1 ${quest.isCompleted ? 'line-through decoration-system-blue' : ''}`}>
                                    {quest.title}
                                </h3>
                            </div>
                            
                            <p className="text-gray-400 font-rajdhani text-sm mb-3">
                                {quest.description}
                            </p>
                            
                            {/* Subtasks List */}
                            {quest.subtasks && quest.subtasks.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {quest.subtasks.map(subtask => (
                                        <div key={subtask.id} className="flex items-center gap-3 group/sub">
                                            <button 
                                                onClick={() => handleSubtaskToggle(quest, subtask)}
                                                className={`
                                                    w-4 h-4 rounded border flex items-center justify-center transition-colors
                                                    ${subtask.isCompleted 
                                                        ? 'bg-gray-500 border-gray-500 text-black' 
                                                        : 'border-gray-600 hover:border-system-blue text-transparent'
                                                    }
                                                `}
                                                disabled={quest.isCompleted}
                                            >
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </button>
                                            <span className={`text-sm font-rajdhani ${subtask.isCompleted ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                                                {subtask.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4 text-xs font-mono text-gray-500 uppercase mt-2">
                                <span className="flex items-center gap-1 text-system-gold">
                                <Circle className="w-2 h-2 fill-current" />
                                XP +{quest.rewardXp}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-200">
                                <Circle className="w-2 h-2 fill-current" />
                                GOLD +{quest.rewardGold}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
             )}
          </div>
        ))}
      </div>
      
      {/* WISH BUTTON */}
      {allCompleted && (
        <div className="mt-4 animate-pulse">
            <button 
                onClick={onOpenWish}
                className="w-full py-4 bg-gradient-to-r from-yellow-900/80 to-yellow-600/80 border-2 border-system-gold text-white font-orbitron font-bold text-xl tracking-widest uppercase rounded hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center justify-center gap-3"
            >
                <Sparkles className="w-6 h-6 animate-spin-slow" />
                MAKE A WISH
                <Sparkles className="w-6 h-6 animate-spin-slow" />
            </button>
            <div className="text-center text-system-gold font-mono text-xs mt-2 tracking-widest">
                SYSTEM REWARD AVAILABLE
            </div>
        </div>
      )}

      {/* Decorative Lines */}
      <div className={`absolute bottom-4 right-4 w-16 h-1 ${allCompleted ? 'bg-system-gold' : 'bg-system-blue/30'}`}></div>
    </div>
  );
};