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

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'success';
      case 'missed': return 'destructive';
    }
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
          <h1 className="text-3xl font-bold mb-2">My Goals</h1>
          <p className="text-muted-foreground">
            Set and track your performance goals
          </p>
        </div>
        <GoalDialog onClose={loadGoals} />
      </div>

      {goals.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>No Goals Set Yet</CardTitle>
                <CardDescription>
                  Set your first goal to start tracking your progress
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Goals help you stay focused and motivated. Set weekly, monthly, or seasonal targets for your performance, training, or skill development.
            </p>
            <GoalDialog onClose={loadGoals} />
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>
                  {activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'} in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{goal.title}</h3>
                            <Badge variant="outline">{getTypeLabel(goal.type)}</Badge>
                            <Badge variant="secondary">{goal.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          <Button variant="ghost" size="icon" onClick={() => handleMarkComplete(goal)}>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteGoal(goal)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {goal.targetValue && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{getProgressPercentage(goal).toFixed(0)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(goal)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {completedGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Goals</CardTitle>
                <CardDescription>
                  {completedGoals.length} {completedGoals.length === 1 ? 'goal' : 'goals'} achieved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteGoal(goal)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteGoal?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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