import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { gameStatsStorage, trainingStorage } from '@/lib/storage';
import { TrendingUp, Target, Award, Calendar, ArrowRight, Activity, Moon, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { GameStat, TrainingSession } from '@/types';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [games, setGames] = useState<GameStat[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  useEffect(() => {
    if (user) {
      const userGames = gameStatsStorage.getAll().filter(g => g.userId === user.id);
      const userSessions = trainingStorage.getAll().filter(s => s.userId === user.id);
      setGames(userGames);
      setSessions(userSessions);
    }
  }, [user]);

  const calculateAverage = (stat: keyof Pick<GameStat, 'points' | 'assists' | 'rebounds'>) => {
    if (games.length === 0) return 0;
    const sum = games.reduce((acc, game) => acc + game[stat], 0);
    return (sum / games.length).toFixed(1);
  };

  const getPersonalBest = () => {
    if (games.length === 0) return null;
    return games.reduce((max, game) => game.points > max.points ? game : max);
  };

  const getReadinessScore = () => {
    if (games.length === 0) return 0;
    const avgPoints = parseFloat(calculateAverage('points'));
    return Math.min(Math.round((avgPoints / 20) * 100), 100);
  };

  const getActivityScore = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivities = [...games, ...sessions].filter(item => new Date(item.date) >= weekAgo);
    return Math.min(recentActivities.length * 15, 100);
  };

  const personalBest = getPersonalBest();
  const readinessScore = getReadinessScore();
  const activityScore = getActivityScore();
  const hasNoData = games.length === 0 && sessions.length === 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {profile?.name}!</h1>
        <p className="text-gray-400">
          {hasNoData
            ? "Let's start tracking your progress!"
            : "Here's your progress overview"}
        </p>
      </div>

      {/* Circular Metrics */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="url(#gradient-blue)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(readinessScore / 100) * 201} 201`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{readinessScore}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Performance</span>
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="url(#gradient-purple)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(games.length > 0 ? 85 : 0) / 100 * 201} 201`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{games.length}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Games</span>
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(16, 185, 129, 0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="url(#gradient-green)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${activityScore / 100 * 201} 201`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{activityScore}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Activity</span>
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(251, 146, 60, 0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="url(#gradient-orange)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(sessions.length > 0 ? 75 : 0) / 100 * 201} 201`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{sessions.length}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Training</span>
        </div>
      </div>

      {/* Quick Actions - Show above Spotlight when no data */}
      {hasNoData && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Get Started</h2>
          <div className="space-y-3">
            <Link to="/stats/games">
              <Card className="gradient-card-blue border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="gradient-icon-blue p-3 rounded-2xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Log Your First Game</h3>
                    <p className="text-sm text-gray-400">Track your performance and see your stats</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/stats/training">
              <Card className="gradient-card-purple border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="gradient-icon-purple p-3 rounded-2xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Track Training</h3>
                    <p className="text-sm text-gray-400">Log drills and monitor skill development</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Spotlight Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Spotlight</h2>
        
        {/* Performance Card */}
        <Card className="gradient-card-blue border-blue-500/20 mb-4 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="gradient-icon-blue p-3 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Performance</span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold text-white">{readinessScore}</span>
                <span className="text-lg text-blue-400">
                  {readinessScore >= 80 ? 'Optimal' : readinessScore >= 60 ? 'Good' : 'Fair'}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">Keep it up!</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {games.length > 0 
                ? `You're averaging ${calculateAverage('points')} points per game. Your consistency is paying off!`
                : "Start logging your games to track your performance and see your progress over time."}
            </p>
          </CardContent>
        </Card>

        {/* Training Card */}
        <Card className="gradient-card-purple border-purple-500/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="gradient-icon-purple p-3 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Training</span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold text-white">{sessions.length}</span>
                <span className="text-lg text-purple-400">Sessions</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">Build your foundation</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {sessions.length > 0
                ? "Your dedication to training is building the skills you need to excel in games."
                : "Log your training sessions to track skill development and see improvement over time."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      {games.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Season Averages</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="gradient-card-blue border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{calculateAverage('points')}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">PPG</div>
              </CardContent>
            </Card>
            <Card className="gradient-card-purple border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{calculateAverage('assists')}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">APG</div>
              </CardContent>
            </Card>
            <Card className="gradient-card-green border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{calculateAverage('rebounds')}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">RPG</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;