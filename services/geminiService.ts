import { GoogleGenAI, Type } from "@google/genai";
import { Quest, QuestDifficulty, PlayerStats, WishReward, StatType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Instruction for the "System" persona
const SYSTEM_INSTRUCTION = `
You are "The System", an advanced, game-like AI interface that governs the user's life.
Your tone is robotic, authoritative, yet helpful.
Use terms like "Player", "Quest", "Report", "Penalty".
Keep responses concise and formatted like system notifications.
`;

export const generateDailyQuests = async (playerStats: PlayerStats): Promise<Quest[]> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate 3 distinct daily tasks (quests) for a Level ${playerStats.level} Player following this strict mandatory routine:

    1. Physical Conditioning:
       - 25 Push-ups
       - 50 Sit-ups
       - 100 Jumping Jacks
       
    2. Wellness & Health:
       - Drink 1 Liter Water (Lunch)
       - Drink 1 Liter Water (Dinner)
       - Consume Maintenance Medicines
       
    3. Knowledge Acquisition:
       - Research, Learn, and Update System
       - Research, Learn, and Update Survival Skills

    You may add flavor text to the descriptions based on the player's level, but the core subtasks and numbers must remain exactly as specified above.
    
    Classify each task correctly into 'Physical Conditioning', 'Wellness & Health', and 'Knowledge Acquisition'.
    Return the response as a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["E", "D", "C", "B", "A", "S"] },
              rewardXp: { type: Type.INTEGER },
              rewardGold: { type: Type.INTEGER },
              statCategory: { type: Type.STRING, enum: Object.values(StatType) },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING }
                  },
                  required: ["text"]
                }
              }
            },
            required: ["title", "description", "difficulty", "rewardXp", "rewardGold", "statCategory"],
          },
        },
      },
    });

    const rawQuests = JSON.parse(response.text || "[]");
    
    // Map to internal Quest interface
    return rawQuests.map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
      isCompleted: false,
      type: 'DAILY',
      subtasks: q.subtasks ? q.subtasks.map((st: any) => ({
        id: crypto.randomUUID(),
        text: st.text,
        isCompleted: false
      })) : []
    }));
  } catch (error) {
    console.error("Failed to generate quests:", error);
    // Fallback quests if AI fails - Updated to match user's strict routine
    return [
      {
        id: crypto.randomUUID(),
        title: "Physical Conditioning",
        description: "Daily mandatory physical maintenance.",
        difficulty: QuestDifficulty.D,
        rewardXp: 100,
        rewardGold: 20,
        isCompleted: false,
        type: 'DAILY',
        statCategory: StatType.PHYSICAL,
        subtasks: [
          { id: crypto.randomUUID(), text: "25 Push-ups", isCompleted: false },
          { id: crypto.randomUUID(), text: "50 Sit-ups", isCompleted: false },
          { id: crypto.randomUUID(), text: "100 Jumping Jacks", isCompleted: false },
        ]
      },
      {
        id: crypto.randomUUID(),
        title: "Wellness & Health",
        description: "Maintain biological homeostasis.",
        difficulty: QuestDifficulty.E,
        rewardXp: 50,
        rewardGold: 10,
        isCompleted: false,
        type: 'DAILY',
        statCategory: StatType.WELLNESS,
        subtasks: [
           { id: crypto.randomUUID(), text: "Drink 1L Water (Lunch)", isCompleted: false },
           { id: crypto.randomUUID(), text: "Drink 1L Water (Dinner)", isCompleted: false },
           { id: crypto.randomUUID(), text: "Consume Maintenance Medicines", isCompleted: false },
        ]
      },
       {
        id: crypto.randomUUID(),
        title: "Knowledge Acquisition",
        description: "Update database and survival protocols.",
        difficulty: QuestDifficulty.C,
        rewardXp: 75,
        rewardGold: 15,
        isCompleted: false,
        type: 'DAILY',
        statCategory: StatType.KNOWLEDGE,
        subtasks: [
            { id: crypto.randomUUID(), text: "Research, Learn & Update System", isCompleted: false },
            { id: crypto.randomUUID(), text: "Research, Learn & Update Survival Skills", isCompleted: false },
        ]
      }
    ];
  }
};

export const chatWithSystem = async (message: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Player Context: ${context}\n\nPlayer Message: ${message}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "SYSTEM ERROR: Connection unstable.";
  } catch (error) {
    console.error("Chat error:", error);
    return "SYSTEM ALERT: Unable to process request. Try again later.";
  }
};

export const evaluateWish = async (wish: string, playerStats: PlayerStats): Promise<WishReward> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    The Player (Level ${playerStats.level}) has completed all daily tasks and is granted a wish.
    They wish for: "${wish}".
    
    Interpret this wish as "The System".
    - If the wish is humble or growth-oriented, grant XP, Gold, or increase a Stat Counter (Physical, Knowledge, etc).
    - If the wish is for recovery, grant a 'HEAL'.
    - If greedy, grant a 'PENALTY'.
    
    Return a JSON object.
    For 'statTarget', select from: 'Physical Conditioning', 'Knowledge Acquisition', 'Wellness & Health', 'Daily Routine'.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            rewardType: { type: Type.STRING, enum: ['XP', 'GOLD', 'STAT', 'ITEM', 'PENALTY', 'HEAL'] },
            rewardValue: { type: Type.INTEGER },
            statTarget: { type: Type.STRING, enum: Object.values(StatType), nullable: true },
          },
          required: ["message", "rewardType", "rewardValue"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as WishReward;
  } catch (error) {
    console.error("Wish error", error);
    return {
      message: "SYSTEM ERROR: Wish computation failed. Consolation prize awarded.",
      rewardType: "GOLD",
      rewardValue: 10
    };
  }
};