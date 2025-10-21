export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface PlayerProfile {
  userId: string;
  name: string;
  team: string;
  position: string;
  ageGroup: string;
  sport: string;
  height?: string;
  weight?: string;
  wingspan?: string;
  goals: string;
  photo?: string;
  bio?: string;
  photos: string[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  category: 'performance' | 'training' | 'skill';
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  metric?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'missed';
  createdAt: string;
  updatedAt: string;
}

export interface GameStat {
  id: string;
  userId: string;
  date: string;
  opponent: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes: number;
  customStats?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  userId: string;
  date: string;
  drillType: string;
  metrics: {
    freeThrowPercentage?: number;
    threePointPercentage?: number;
    midRangePercentage?: number;
    layupPercentage?: number;
    speed?: number;
    agility?: number;
    vertical?: number;
    reactionTime?: number;
    [key: string]: number | undefined;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeNote {
  id: string;
  userId: string;
  date: string;
  type: 'practice' | 'workout' | 'nutrition';
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AISummary {
  id: string;
  userId: string;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  insights: string[];
  improvements: Array<{
    metric: string;
    change: number;
    description: string;
  }>;
  focusAreas: string[];
  motivationalMessage: string;
  createdAt: string;
}

export interface PersonalBest {
  metric: string;
  value: number;
  date: string;
  gameId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface ShareLink {
  id: string;
  token: string;
  userId: string;
  playerName: string;
  createdAt: string;
  expiresAt?: string;
  viewCount: number;
  lastViewed?: string;
}