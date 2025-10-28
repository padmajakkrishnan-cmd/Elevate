import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { gameStatsApi, trainingSessionsApi, aiApi, type AIInsights } from '@/lib/api';
import { TrendingUp, Target, Award, Calendar, ArrowRight, Activity, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GameStat, TrainingSession } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Fetch game stats
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: gameStatsApi.getAll,
    enabled: !!user,
  });

  // Fetch training sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['trainingSessions'],
    queryFn: trainingSessionsApi.getAll,
    enabled: !!user,
  });

  const calculateAverage = (stat: keyof Pick<GameStat, 'points' | 'assists' | 'rebounds'>) => {
    if (games.length === 0) return '0';
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
  const isLoading = gamesLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

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
        
        {/* Performance Card with AI Insights */}
        <Card className="gradient-card-blue border-blue-500/20 mb-4 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="gradient-icon-blue p-3 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Performance</span>
            </div>
            
            {!aiInsights ? (
              <>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold text-white">{readinessScore}</span>
                    <span className="text-lg text-blue-400">
                      {readinessScore >= 80 ? 'Optimal' : readinessScore >= 60 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">Keep it up!</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {games.length > 0
                    ? `You're averaging ${calculateAverage('points')} points per game. Your consistency is paying off!`
                    : "Start logging your games to track your performance and see your progress over time."}
                </p>

                {games.length > 0 && (
                  <Button
                    onClick={async () => {
                      setIsGeneratingInsights(true);
                      try {
                        console.log('Calling AI insights API...');
                        const insights = await aiApi.generateInsights();
                        console.log('AI insights received:', insights);
                        setAiInsights(insights);
                        showSuccess('AI insights generated!');
                      } catch (error) {
                        console.error('AI insights error:', error);
                        showError(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      } finally {
                        setIsGeneratingInsights(false);
                      }
                    }}
                    disabled={isGeneratingInsights}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingInsights ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating AI Insights...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Insights
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Takeaway */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Your Progress</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {aiInsights.takeaway}
                  </p>
                </div>

                {/* Progress Areas */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Performance Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-xs mt-0.5">●</span>
                      <div>
                        <span className="text-xs font-medium text-gray-400">Scoring:</span>
                        <span className="text-xs text-gray-300 ml-1">{aiInsights.progress.scoring}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-xs mt-0.5">●</span>
                      <div>
                        <span className="text-xs font-medium text-gray-400">Playmaking:</span>
                        <span className="text-xs text-gray-300 ml-1">{aiInsights.progress.playmaking}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-xs mt-0.5">●</span>
                      <div>
                        <span className="text-xs font-medium text-gray-400">Defense:</span>
                        <span className="text-xs text-gray-300 ml-1">{aiInsights.progress.defense}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-xs mt-0.5">●</span>
                      <div>
                        <span className="text-xs font-medium text-gray-400">Ball Control:</span>
                        <span className="text-xs text-gray-300 ml-1">{aiInsights.progress.ballControl}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-xs mt-0.5">●</span>
                      <div>
                        <span className="text-xs font-medium text-gray-400">Rebounding:</span>
                        <span className="text-xs text-gray-300 ml-1">{aiInsights.progress.rebounding}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">What to Work On Next</h4>
                  <div className="space-y-2">
                    {aiInsights.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 text-xs mt-0.5">{index + 1}.</span>
                        <span className="text-xs text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setAiInsights(null)}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  Generate New Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Card */}
        <Link to="/stats/training">
          <Card className="gradient-card-purple border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all cursor-pointer">
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
        </Link>
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