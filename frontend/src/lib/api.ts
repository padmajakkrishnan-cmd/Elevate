import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  User, 
  PlayerProfile, 
  GameStat, 
  TrainingSession, 
  AISummary, 
  ShareLink, 
  Goal 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (idToken: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      id_token: idToken,
    });
    return response.data;
  },

  signup: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      email,
      password,
    });
    return response.data;
  },

  googleAuth: async (credential: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, {
      credential,
    });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  const snakeCaseObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return snakeCaseObj;
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const camelCaseObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelCaseObj;
};

// Profile API
export const profileApi = {
  get: async () => {
    const response = await apiClient.get<any>('/profile');
    return toCamelCase(response.data) as PlayerProfile;
  },

  create: async (profile: Omit<PlayerProfile, 'userId' | 'createdAt' | 'updatedAt'>) => {
    const snakeCaseProfile = toSnakeCase(profile);
    const response = await apiClient.post<any>('/profile', snakeCaseProfile);
    return toCamelCase(response.data) as PlayerProfile;
  },

  update: async (profile: Partial<Omit<PlayerProfile, 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const snakeCaseProfile = toSnakeCase(profile);
    const response = await apiClient.put<any>('/profile', snakeCaseProfile);
    return toCamelCase(response.data) as PlayerProfile;
  },
};

// Game Stats API
export const gameStatsApi = {
  getAll: async () => {
    const response = await apiClient.get<GameStat[]>('/game-stats');
    return response.data;
  },

  create: async (stat: Omit<GameStat, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<GameStat>('/game-stats', stat);
    return response.data;
  },

  update: async (id: string, stat: Partial<Omit<GameStat, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const response = await apiClient.put<GameStat>(`/game-stats/${id}`, stat);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/game-stats/${id}`);
  },
};

// Training Sessions API
export const trainingSessionsApi = {
  getAll: async () => {
    const response = await apiClient.get<any[]>('/training-sessions');
    return response.data.map(toCamelCase) as TrainingSession[];
  },

  create: async (session: Omit<TrainingSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const snakeCaseSession = toSnakeCase(session);
    const response = await apiClient.post<any>('/training-sessions', snakeCaseSession);
    return toCamelCase(response.data) as TrainingSession;
  },

  update: async (id: string, session: Partial<Omit<TrainingSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const snakeCaseSession = toSnakeCase(session);
    const response = await apiClient.put<any>(`/training-sessions/${id}`, snakeCaseSession);
    return toCamelCase(response.data) as TrainingSession;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/training-sessions/${id}`);
  },
};

// Goals API
export const goalsApi = {
  getAll: async () => {
    const response = await apiClient.get<Goal[]>('/goals');
    return response.data;
  },

  create: async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<Goal>('/goals', goal);
    return response.data;
  },

  update: async (id: string, goal: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const response = await apiClient.put<Goal>(`/goals/${id}`, goal);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/goals/${id}`);
  },
};

// Insights API
export const insightsApi = {
  generate: async (period: 'weekly' | 'monthly') => {
    const response = await apiClient.post<AISummary>('/insights/generate', { period });
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<AISummary[]>('/insights');
    return response.data;
  },
};

// Share API
export const shareApi = {
  create: async () => {
    const response = await apiClient.post<any>('/share');
    return toCamelCase(response.data) as ShareLink;
  },

  getAll: async () => {
    const response = await apiClient.get<any[]>('/share');
    return response.data.map(toCamelCase) as ShareLink[];
  },

  getByToken: async (token: string) => {
    const response = await axios.get<{
      profile: PlayerProfile;
      gameStats: GameStat[];
      trainingSessions: TrainingSession[];
      goals: Goal[];
    }>(`${API_BASE_URL}/share/report/${token}`);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/share/${id}`);
  },
};

// AI Insights API
export interface AIInsights {
  takeaway: string;
  progress: {
    scoring: string;
    playmaking: string;
    defense: string;
    ballControl: string;
    rebounding: string;
  };
  nextSteps: string[];
  generatedAt: string;
  model: string;
}

export const aiApi = {
  generateInsights: async () => {
    const response = await apiClient.post<any>('/ai/generate-insights');
    return toCamelCase(response.data) as AIInsights;
  },
};

export default apiClient;