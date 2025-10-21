import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react';
import { gameStatsStorage, trainingStorage, goalsStorage, summariesStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { generateInsights } from '@/lib/aiInsights';
import type { AISummary, GameStat, TrainingSession } from '@/types';
import { showSuccess } from '@/utils/toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

const Insights = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [generating, setGenerating] = useState(false);

  const loadSummaries = () => {
    const allSummaries = summariesStorage.getAll();
    const userSummaries = allSummaries.filter(s => s.userId === user?.id);
    setSummaries(userSummaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadSummaries();
  }, [user]);

  const generateSummary = (period: 'weekly' | 'monthly') => {
    if (!user) return;
    
    setGenerating(true);

    const games = gameStatsStorage.getAll().filter(g => g.userId === user.id);
    const sessions = trainingStorage.getAll().filter(s => s.userId === user.id);
    const goals = goalsStorage.getAll().filter(g => g.userId === user.id);

    const now = new Date();
    const startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const insights = generateInsights({ games, sessions, goals, period });

    const summary: AISummary = {
      id: crypto.randomUUID(),
      userId: user.id,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      insights: insights.insights,
      improvements: insights.improvements,
      focusAreas: insights.focusAreas,
      motivationalMessage: insights.motivationalMessage,
      createdAt: now.toISOString(),
    };

    summariesStorage.add(summary);
    showSuccess(`${period === 'weekly' ? 'Weekly' : 'Monthly'} summary generated!`);
    loadSummaries();
    setGenerating(false);
  };

  const weeklySummaries = summaries.filter(s => s.period === 'weekly');
  const monthlySummaries = summaries.filter(s => s.period === 'monthly');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
          <p className="text-muted-foreground">
            Personalized analysis and recommendations based on your performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateSummary('weekly')} disabled={generating}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Weekly
          </Button>
          <Button onClick={() => generateSummary('monthly')} disabled={generating} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Monthly
          </Button>
        </div>
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>No Insights Yet</CardTitle>
                <CardDescription>
                  Generate your first AI-powered summary to get personalized insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Once you've logged games and training sessions, click "Generate Weekly" or "Generate Monthly" to get AI-powered insights about your performance, improvements, and areas to focus on.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => generateSummary('weekly')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Weekly Summary
              </Button>
              <Button onClick={() => generateSummary('monthly')} variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Monthly Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Summaries</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {summaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {weeklySummaries.length > 0 ? (
              weeklySummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No weekly summaries yet. Generate one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            {monthlySummaries.length > 0 ? (
              monthlySummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No monthly summaries yet. Generate one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const SummaryCard = ({ summary }: { summary: AISummary }) => {
  const { user } = useAuth();
  
  // Get data for the summary period
  const getPerformanceData = () => {
    const games = gameStatsStorage.getAll().filter(g => g.userId === user?.id);
    const periodGames = games.filter(g => {
      const gameDate = new Date(g.date);
      return gameDate >= new Date(summary.startDate) && gameDate <= new Date(summary.endDate);
    });

    return periodGames
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => ({
        date: new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        points: game.points,
        assists: game.assists,
        rebounds: game.rebounds,
      }));
  };

  const getShootingData = () => {
    const sessions = trainingStorage.getAll().filter(s => s.userId === user?.id);
    const periodSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= new Date(summary.startDate) && sessionDate <= new Date(summary.endDate);
    });

    return periodSessions
      .filter(s => s.metrics.freeThrowPercentage || s.metrics.threePointPercentage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(session => ({
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Free Throw %': session.metrics.freeThrowPercentage || 0,
        '3-Point %': session.metrics.threePointPercentage || 0,
      }));
  };

  const getImprovementChartData = () => {
    return summary.improvements.map(imp => ({
      metric: imp.metric,
      change: Math.abs(imp.change),
      fill: imp.change > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
    }));
  };

  const performanceData = getPerformanceData();
  const shootingData = getShootingData();
  const improvementData = getImprovementChartData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {summary.period === 'weekly' ? 'Weekly' : 'Monthly'} Summary
            </CardTitle>
            <CardDescription>
              {new Date(summary.startDate).toLocaleDateString()} - {new Date(summary.endDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant="outline">{summary.period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Trend Chart */}
        {performanceData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="points" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Points" />
                <Area type="monotone" dataKey="assists" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} name="Assists" />
                <Area type="monotone" dataKey="rebounds" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} name="Rebounds" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Shooting Progress Chart */}
        {shootingData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Shooting Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={shootingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Free Throw %" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="3-Point %" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Key Insights */}
        {summary.insights.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Key Insights
            </h3>
            <ul className="space-y-2">
              {summary.insights.map((insight, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements Chart */}
        {improvementData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Improvements
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={improvementData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="change" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {summary.improvements.map((improvement, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{improvement.metric}</span>
                    <Badge variant={improvement.change > 0 ? 'default' : 'secondary'}>
                      {improvement.change > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(improvement.change)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{improvement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {summary.focusAreas.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Focus Areas
            </h3>
            <ul className="space-y-2">
              {summary.focusAreas.map((area, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Motivational Message */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">{summary.motivationalMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Insights;