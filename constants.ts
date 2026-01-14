import { PlayerStats, StatType } from './types';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  level: 1,
  currentXp: 0,
  requiredXp: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  gold: 0,
  unassignedPoints: 0,
  title: "None",
  job: "None",
  stats: {
    [StatType.PHYSICAL]: 0,
    [StatType.KNOWLEDGE]: 0,
    [StatType.WELLNESS]: 0,
    [StatType.ROUTINE]: 0,
  },
  penaltyActive: false,
  penaltyExpires: 0,
  lastActiveDate: new Date().toDateString()
};

export const LEVEL_SCALING_FACTOR = 1.2;
