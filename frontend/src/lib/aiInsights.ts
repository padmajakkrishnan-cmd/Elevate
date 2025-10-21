import type { GameStat, TrainingSession, Goal } from '@/types';

interface InsightData {
  games: GameStat[];
  sessions: TrainingSession[];
  goals: Goal[];
  period: 'weekly' | 'monthly';
}

export const generateInsights = (data: InsightData) => {
  const { games, sessions, goals, period } = data;
  
  // Filter data by period
  const now = new Date();
  const periodStart = new Date();
  if (period === 'weekly') {
    periodStart.setDate(now.getDate() - 7);
  } else {
    periodStart.setMonth(now.getMonth() - 1);
  }

  const periodGames = games.filter(g => new Date(g.date) >= periodStart);
  const periodSessions = sessions.filter(s => new Date(s.date) >= periodStart);

  // Calculate improvements
  const improvements = [];
  
  // Points improvement
  if (periodGames.length >= 2) {
    const recentGames = periodGames.slice(0, Math.ceil(periodGames.length / 2));
    const olderGames = periodGames.slice(Math.ceil(periodGames.length / 2));
    
    const recentAvg = recentGames.reduce((sum, g) => sum + g.points, 0) / recentGames.length;
    const olderAvg = olderGames.reduce((sum, g) => sum + g.points, 0) / olderGames.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (Math.abs(change) > 5) {
      improvements.push({
        metric: 'Points Per Game',
        change: Math.round(change),
        description: change > 0 
          ? `Your scoring improved by ${Math.round(change)}% this ${period}!`
          : `Your scoring decreased by ${Math.abs(Math.round(change))}% - let's work on getting back on track.`
      });
    }
  }

  // Shooting improvement
  const shootingSessions = periodSessions.filter(s => 
    s.metrics.freeThrowPercentage || s.metrics.threePointPercentage
  );
  
  if (shootingSessions.length >= 2) {
    const recentShooting = shootingSessions.slice(0, Math.ceil(shootingSessions.length / 2));
    const olderShooting = shootingSessions.slice(Math.ceil(shootingSessions.length / 2));
    
    const recentFT = recentShooting
      .filter(s => s.metrics.freeThrowPercentage)
      .reduce((sum, s) => sum + (s.metrics.freeThrowPercentage || 0), 0) / recentShooting.filter(s => s.metrics.freeThrowPercentage).length;
    
    const olderFT = olderShooting
      .filter(s => s.metrics.freeThrowPercentage)
      .reduce((sum, s) => sum + (s.metrics.freeThrowPercentage || 0), 0) / olderShooting.filter(s => s.metrics.freeThrowPercentage).length;
    
    if (recentFT && olderFT) {
      const change = recentFT - olderFT;
      if (Math.abs(change) > 3) {
        improvements.push({
          metric: 'Free Throw %',
          change: Math.round(change),
          description: change > 0
            ? `Your free throw shooting improved by ${Math.round(change)}% - great work at the line!`
            : `Your free throw percentage dropped ${Math.abs(Math.round(change))}% - more practice needed.`
        });
      }
    }
  }

  // Generate insights
  const insights = [];
  
  if (periodGames.length > 0) {
    insights.push(`You played ${periodGames.length} ${periodGames.length === 1 ? 'game' : 'games'} this ${period}.`);
    
    const avgPoints = periodGames.reduce((sum, g) => sum + g.points, 0) / periodGames.length;
    insights.push(`You averaged ${avgPoints.toFixed(1)} points per game.`);
  }

  if (periodSessions.length > 0) {
    insights.push(`You completed ${periodSessions.length} training ${periodSessions.length === 1 ? 'session' : 'sessions'} - excellent dedication!`);
  }

  // Focus areas
  const focusAreas = [];
  
  if (periodGames.length > 0) {
    const avgTurnovers = periodGames.reduce((sum, g) => sum + g.turnovers, 0) / periodGames.length;
    if (avgTurnovers > 3) {
      focusAreas.push('Ball handling - work on reducing turnovers through control drills');
    }
    
    const avgAssists = periodGames.reduce((sum, g) => sum + g.assists, 0) / periodGames.length;
    if (avgAssists < 2) {
      focusAreas.push('Playmaking - focus on court vision and passing drills');
    }
  }

  if (shootingSessions.length > 0) {
    const avg3PT = shootingSessions
      .filter(s => s.metrics.threePointPercentage)
      .reduce((sum, s) => sum + (s.metrics.threePointPercentage || 0), 0) / shootingSessions.filter(s => s.metrics.threePointPercentage).length;
    
    if (avg3PT && avg3PT < 35) {
      focusAreas.push('Three-point shooting - increase practice volume and focus on form');
    }
  }

  // Motivational message
  let motivationalMessage = '';
  if (improvements.length > 0 && improvements.some(i => i.change > 0)) {
    motivationalMessage = "You're making great progress! Keep up the hard work and stay focused on your goals.";
  } else if (periodGames.length > 0 || periodSessions.length > 0) {
    motivationalMessage = "Consistency is key! Keep showing up and putting in the work - results will follow.";
  } else {
    motivationalMessage = "Ready to get started? Log your games and training to track your progress!";
  }

  return {
    insights,
    improvements,
    focusAreas,
    motivationalMessage,
  };
};