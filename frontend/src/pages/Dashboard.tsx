import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { gameStatsStorage, trainingStorage } from '@/lib/storage';
import { TrendingUp, Target, Award, Calendar, ArrowRight } from 'lucide-react';
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

  const getRecentGames = () => {
    return games
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const getRecentSessions = () => {
    return sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const getPersonalBest = () => {
    if (games.length === 0) return null;
    return games.reduce((max, game) => game.points > max.points ? game : max);
  };

  const personalBest = getPersonalBest();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name}!</h1>
        <p className="text-muted-foreground">
          {games.length === 0 && sessions.length === 0 
            ? "Let's start tracking your progress!"
            : "Here's your progress overview. Keep up the great work!"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{games.length}</div>
            <p className="text-xs text-muted-foreground">
              {games.length === 0 ? 'Start logging your games!' : `PPG: ${calculateAverage('points')}`}
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
            <p className="text-xs text-muted-foreground">
              {sessions.length === 0 ? 'Track your practice progress' : 'Sessions logged'}
            </p>
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
              {personalBest ? `vs ${personalBest.opponent}` : 'Log games to track'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...games, ...sessions].filter(item => {
                const itemDate = new Date(item.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return itemDate >= weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Activities logged
            </p>
          </CardContent>
        </Card>
      </div>

      {games.length === 0 && sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Start tracking your performance to see your progress visualized here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link to="/stats/games">
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Log Your First Game</h3>
                    <p className="text-sm text-muted-foreground">
                      Record your game stats to start tracking your performance over time
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>

              <Link to="/stats/training">
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Track Training Sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Log your practice drills and see improvement in your skills
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {games.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Games</CardTitle>
                  <Link to="/stats/games">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentGames().map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">vs {game.opponent}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(game.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{game.points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Training</CardTitle>
                  <Link to="/stats/training">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentSessions().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{session.drillType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {session.metrics.freeThrowPercentage && (
                          <p className="text-sm">FT: {session.metrics.freeThrowPercentage}%</p>
                        )}
                        {session.metrics.threePointPercentage && (
                          <p className="text-sm">3PT: {session.metrics.threePointPercentage}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Season Averages</CardTitle>
            <CardDescription>Your performance across all games</CardDescription>
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
    </div>
  );
};

export default Dashboard;