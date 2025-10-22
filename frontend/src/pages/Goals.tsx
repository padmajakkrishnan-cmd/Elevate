import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GoalDialog } from '@/components/GoalDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Target, CheckCircle2, Clock } from 'lucide-react';
import { goalsStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import type { Goal } from '@/types';
import { showSuccess } from '@/utils/toast';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null);

  const loadGoals = () => {
    const allGoals = goalsStorage.getAll();
    const userGoals = allGoals.filter(g => g.userId === user?.id);
    setGoals(userGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  const handleDelete = () => {
    if (deleteGoal) {
      goalsStorage.delete(deleteGoal.id);
      showSuccess('Goal deleted');
      loadGoals();
      setDeleteGoal(null);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleCloseDialog = () => {
    setEditingGoal(undefined);
    loadGoals();
  };

  const handleMarkComplete = (goal: Goal) => {
    goalsStorage.update(goal.id, { status: 'completed' });
    showSuccess('Goal marked as completed! 🎉');
    loadGoals();
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getTypeLabel = (type: Goal['type']) => {
    switch (type) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'seasonal': return 'Seasonal';
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">My Goals</h1>
          <p className="text-gray-400">
            Set and track your performance goals
          </p>
        </div>
        <GoalDialog onClose={loadGoals} />
      </div>

      {goals.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-card-blue border-blue-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">{activeGoals.length}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Active Goals</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-green border-green-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">{completedGoals.length}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Completed</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-purple border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {goals.length === 0 ? (
        <Card className="gradient-card-blue border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="gradient-icon-blue p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Goals Set Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Set your first goal to start tracking your progress. Goals help you stay focused and motivated.
            </p>
            <GoalDialog onClose={loadGoals} />
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <Card className="gradient-card-blue border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white">Active Goals</CardTitle>
                <CardDescription className="text-gray-400">
                  {activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'} in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{goal.title}</h3>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {getTypeLabel(goal.type)}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {goal.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{goal.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                            </span>
                            {goal.targetValue && goal.metric && (
                              <span>Target: {goal.targetValue} {goal.metric}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="icon" onClick={() => handleMarkComplete(goal)} className="hover:bg-white/10">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)} className="hover:bg-white/10">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteGoal(goal)} className="hover:bg-white/10">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                      {goal.targetValue && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="font-medium text-white">{getProgressPercentage(goal).toFixed(0)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(goal)} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {completedGoals.length > 0 && (
            <Card className="gradient-card-green border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Completed Goals</CardTitle>
                <CardDescription className="text-gray-400">
                  {completedGoals.length} {completedGoals.length === 1 ? 'goal' : 'goals'} achieved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <div>
                          <h3 className="font-semibold text-white">{goal.title}</h3>
                          <p className="text-sm text-gray-400">{goal.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteGoal(goal)} className="hover:bg-white/10">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {editingGoal && (
        <GoalDialog editGoal={editingGoal} onClose={handleCloseDialog} />
      )}

      <AlertDialog open={!!deleteGoal} onOpenChange={() => setDeleteGoal(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deleteGoal?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Goals;