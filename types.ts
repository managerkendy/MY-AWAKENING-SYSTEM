export enum StatType {
  PHYSICAL = 'Physical Conditioning',
  KNOWLEDGE = 'Knowledge Acquisition',
  WELLNESS = 'Wellness & Health',
  ROUTINE = 'Daily Routine'
}

export enum QuestDifficulty {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export interface PlayerStats {
  level: number;
  currentXp: number;
  requiredXp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  unassignedPoints: number;
  stats: Record<StatType, number>;
  title: string;
  job: string;
  penaltyActive: boolean;
  penaltyExpires: number;
  lastActiveDate: string; // ISO Date string to track daily resets
}

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  rewardXp: number;
  rewardGold: number;
  isCompleted: boolean;
  type: 'DAILY' | 'MAIN' | 'HIDDEN';
  statCategory: StatType;
  subtasks?: Subtask[];
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'SYSTEM';
  text: string;
  timestamp: number;
}

export interface WishReward {
  message: string;
  rewardType: 'XP' | 'GOLD' | 'STAT' | 'ITEM' | 'PENALTY' | 'HEAL';
  rewardValue: number;
  statTarget?: StatType; // Optional, only if rewardType is STAT
}
