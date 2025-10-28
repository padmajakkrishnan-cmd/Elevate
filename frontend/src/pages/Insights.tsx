import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react';
import { insightsApi, gameStatsApi, trainingSessionsApi, goalsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AISummary } from '@/types';
import { showSuccess } from '@/utils/toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Insights = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Fetch AI summaries
  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: insightsApi.getAll,
    enabled: !!user,
  });

  // Generate insights mutation
  const generateMutation = useMutation({
    mutationFn: insightsApi.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      showSuccess('AI summary generated!');
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    },
  });

  const generateSummary = (period: 'weekly' | 'monthly') => {
    setGenerating(true);
    generateMutation.mutate(period);
  };

  const sortedSummaries = [...summaries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const weeklySummaries = sortedSummaries.filter(s => s.period === 'weekly');
  const monthlySummaries = sortedSummaries.filter(s => s.period === 'monthly');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">AI Insights</h1>
          <p className="text-gray-400">
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
        <Card className="gradient-card-blue border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="gradient-icon-blue p-2 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">No Insights Yet</CardTitle>
                <CardDescription className="text-gray-400">
                  Generate your first AI-powered summary to get personalized insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
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
            {sortedSummaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {weeklySummaries.length > 0 ? (
              weeklySummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))
            ) : (
              <Card className="gradient-card-blue border-blue-500/20">
                <CardContent className="py-8 text-center text-gray-400">
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
              <Card className="gradient-card-blue border-blue-500/20">
                <CardContent className="py-8 text-center text-gray-400">
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
  
  // Fetch data for charts
  const { data: games = [] } = useQuery({
    queryKey: ['gameStats'],
    queryFn: gameStatsApi.getAll,
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['trainingSessions'],
    queryFn: trainingSessionsApi.getAll,
    enabled: !!user,
  });

  // Get data for the summary period
  const getPerformanceData = () => {
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
    <Card className="gradient-card-blue border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-blue-400" />
              {summary.period === 'weekly' ? 'Weekly' : 'Monthly'} Summary
            </CardTitle>
            <CardDescription className="text-gray-400">
              {new Date(summary.startDate).toLocaleDateString()} - {new Date(summary.endDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-gray-600 text-gray-300">{summary.period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Trend Chart */}
        {performanceData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4" />
              Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="points" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} name="Points" />
                <Area type="monotone" dataKey="assists" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} name="Assists" />
                <Area type="monotone" dataKey="rebounds" stroke="#34d399" fill="#34d399" fillOpacity={0.3} name="Rebounds" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Shooting Progress Chart */}
        {shootingData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <Target className="w-4 h-4" />
              Shooting Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={shootingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Free Throw %" stroke="#60a5fa" strokeWidth={2} />
                <Line type="monotone" dataKey="3-Point %" stroke="#a78bfa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Key Insights */}
        {summary.insights.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <Lightbulb className="w-4 h-4" />
              Key Insights
            </h3>
            <ul className="space-y-2">
              {summary.insights.map((insight, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements Chart */}
        {improvementData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4" />
              Improvements
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={improvementData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="metric" type="category" width={120} stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="change" fill="#60a5fa" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {summary.improvements.map((improvement, idx) => (
                <div key={idx} className="p-3 border border-white/10 rounded-lg bg-black/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{improvement.metric}</span>
                    <Badge variant={improvement.change > 0 ? 'default' : 'secondary'} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {improvement.change > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(improvement.change)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{improvement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {summary.focusAreas.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <Target className="w-4 h-4" />
              Focus Areas
            </h3>
            <ul className="space-y-2">
              {summary.focusAreas.map((area, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Motivational Message */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm font-medium text-blue-300">{summary.motivationalMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Insights;