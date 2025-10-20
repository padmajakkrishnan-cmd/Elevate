import type { User, PlayerProfile, GameStat, TrainingSession, AISummary, ShareLink } from '@/types';

const STORAGE_KEYS = {
  USER: 'elevate_user',
  PROFILE: 'elevate_profile',
  GAME_STATS: 'elevate_game_stats',
  TRAINING_SESSIONS: 'elevate_training_sessions',
  AI_SUMMARIES: 'elevate_ai_summaries',
  SHARE_LINKS: 'elevate_share_links',
  PERSONAL_BESTS: 'elevate_personal_bests',
  ACHIEVEMENTS: 'elevate_achievements',
} as const;

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  },
};

// User functions
export const userStorage = {
  get: (): User | null => storage.get<User>(STORAGE_KEYS.USER),
  set: (user: User): void => storage.set(STORAGE_KEYS.USER, user),
  remove: (): void => storage.remove(STORAGE_KEYS.USER),
};

// Profile functions
export const profileStorage = {
  get: (): PlayerProfile | null => storage.get<PlayerProfile>(STORAGE_KEYS.PROFILE),
  set: (profile: PlayerProfile): void => storage.set(STORAGE_KEYS.PROFILE, profile),
  remove: (): void => storage.remove(STORAGE_KEYS.PROFILE),
};

// Game stats functions
export const gameStatsStorage = {
  getAll: (): GameStat[] => storage.get<GameStat[]>(STORAGE_KEYS.GAME_STATS) || [],
  set: (stats: GameStat[]): void => storage.set(STORAGE_KEYS.GAME_STATS, stats),
  add: (stat: GameStat): void => {
    const stats = gameStatsStorage.getAll();
    stats.push(stat);
    gameStatsStorage.set(stats);
  },
  update: (id: string, updatedStat: Partial<GameStat>): void => {
    const stats = gameStatsStorage.getAll();
    const index = stats.findIndex(s => s.id === id);
    if (index !== -1) {
      stats[index] = { ...stats[index], ...updatedStat, updatedAt: new Date().toISOString() };
      gameStatsStorage.set(stats);
    }
  },
  delete: (id: string): void => {
    const stats = gameStatsStorage.getAll().filter(s => s.id !== id);
    gameStatsStorage.set(stats);
  },
};

// Training sessions functions
export const trainingStorage = {
  getAll: (): TrainingSession[] => storage.get<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS) || [],
  set: (sessions: TrainingSession[]): void => storage.set(STORAGE_KEYS.TRAINING_SESSIONS, sessions),
  add: (session: TrainingSession): void => {
    const sessions = trainingStorage.getAll();
    sessions.push(session);
    trainingStorage.set(sessions);
  },
  update: (id: string, updatedSession: Partial<TrainingSession>): void => {
    const sessions = trainingStorage.getAll();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updatedSession, updatedAt: new Date().toISOString() };
      trainingStorage.set(sessions);
    }
  },
  delete: (id: string): void => {
    const sessions = trainingStorage.getAll().filter(s => s.id !== id);
    trainingStorage.set(sessions);
  },
};

// AI summaries functions
export const summariesStorage = {
  getAll: (): AISummary[] => storage.get<AISummary[]>(STORAGE_KEYS.AI_SUMMARIES) || [],
  set: (summaries: AISummary[]): void => storage.set(STORAGE_KEYS.AI_SUMMARIES, summaries),
  add: (summary: AISummary): void => {
    const summaries = summariesStorage.getAll();
    summaries.push(summary);
    summariesStorage.set(summaries);
  },
};

// Share links functions
export const shareLinksStorage = {
  getAll: (): ShareLink[] => storage.get<ShareLink[]>(STORAGE_KEYS.SHARE_LINKS) || [],
  set: (links: ShareLink[]): void => storage.set(STORAGE_KEYS.SHARE_LINKS, links),
  add: (link: ShareLink): void => {
    const links = shareLinksStorage.getAll();
    links.push(link);
    shareLinksStorage.set(links);
  },
  delete: (id: string): void => {
    const links = shareLinksStorage.getAll().filter(l => l.id !== id);
    shareLinksStorage.set(links);
  },
};