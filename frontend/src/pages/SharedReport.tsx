import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, Award, User } from 'lucide-react';
import { shareApi } from '@/lib/api';
import type { PlayerProfile, GameStat, TrainingSession, Goal } from '@/types';
import { useQuery } from '@tanstack/react-query';

const SharedReport = () => {
  const { token } = useParams<{ token: string }>();

  // Fetch shared report data
  const { data, isLoading, error } = useQuery({
    queryKey: ['sharedReport', token],
    queryFn: () => shareApi.getByToken(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading player report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Report Not Found</CardTitle>
            <CardDescription>
              This share link is invalid or has been deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { profile, gameStats: games, trainingSessions: sessions, goals } = data;

  const calculateAverage = (stat: keyof Pick<GameStat, 'points' | 'assists' | 'rebounds'>) => {
    if (games.length === 0) return '0';
    const sum = games.reduce((acc, game) => acc + game[stat], 0);
    return (sum / games.length).toFixed(1);
  };

  const getPersonalBest = () => {
    if (games.length === 0) return null;
    return games.reduce((max, game) => game.points > max.points ? game : max);
  };

  const personalBest = getPersonalBest();
  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold">Elevate</h1>
          </div>
          <p className="text-muted-foreground">Player Progress Report</p>
        </div>

        {/* Player Profile */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="text-base">
                  {profile.position} • {profile.team} • {profile.ageGroup} years
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(profile.heightFeet && profile.heightInches !== undefined) && (
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-semibold">{profile.heightFeet}'{profile.heightInches}"</p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{profile.weight} lbs</p>
                </div>
              )}
              {(profile.wingspanFeet && profile.wingspanInches !== undefined) && (
                <div>
                  <p className="text-sm text-muted-foreground">Wingspan</p>
                  <p className="font-semibold">{profile.wingspanFeet}'{profile.wingspanInches}"</p>
                </div>
              )}
            </div>
            {profile.bio && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Bio</p>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{games.length}</div>
              <p className="text-xs text-muted-foreground">
                {games.length > 0 ? `PPG: ${calculateAverage('points')}` : 'No games yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">Sessions logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Best</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{personalBest ? personalBest.points : '--'}</div>
              <p className="text-xs text-muted-foreground">
                {personalBest ? `vs ${personalBest.opponent}` : 'No games yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Season Averages */}
        {games.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Season Averages</CardTitle>
              <CardDescription>Performance across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{calculateAverage('points')}</p>
                  <p className="text-sm text-muted-foreground">PPG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{calculateAverage('assists')}</p>
                  <p className="text-sm text-muted-foreground">APG</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{calculateAverage('rebounds')}</p>
                  <p className="text-sm text-muted-foreground">RPG</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Games */}
        {games.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
              <CardDescription>Latest game performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {games
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">vs {game.opponent}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(game.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{game.points}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.assists} AST • {game.rebounds} REB
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
              <CardDescription>What {profile.name} is working towards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <Badge variant="outline">{goal.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Powered by <span className="font-semibold">Elevate</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Making progress visible for every young athlete
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedReport;