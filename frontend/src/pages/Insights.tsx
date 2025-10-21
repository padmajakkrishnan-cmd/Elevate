import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react';
import { gameStatsStorage, trainingStorage, goalsStorage, summariesStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { generateInsights } from '@/lib/aiInsights';
import type { AISummary } from '@/types';
import { showSuccess } from '@/utils/toast';

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

        {/* Improvements */}
        {summary.improvements.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Improvements
            </h3>
            <div className="space-y-3">
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