import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrainingDialog } from '@/components/TrainingDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { trainingStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import type { TrainingSession } from '@/types';
import { showSuccess } from '@/utils/toast';

const TrainingStats = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [editingSession, setEditingSession] = useState<TrainingSession | undefined>();
  const [deleteSession, setDeleteSession] = useState<TrainingSession | null>(null);

  const loadSessions = () => {
    const allSessions = trainingStorage.getAll();
    const userSessions = allSessions.filter(s => s.userId === user?.id);
    setSessions(userSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  const handleDelete = () => {
    if (deleteSession) {
      trainingStorage.delete(deleteSession.id);
      showSuccess('Training session deleted');
      loadSessions();
      setDeleteSession(null);
    }
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session);
  };

  const handleCloseDialog = () => {
    setEditingSession(undefined);
    loadSessions();
  };

  const getMetricDisplay = (session: TrainingSession) => {
    const metrics = [];
    if (session.metrics.freeThrowPercentage) metrics.push(`FT: ${session.metrics.freeThrowPercentage}%`);
    if (session.metrics.threePointPercentage) metrics.push(`3PT: ${session.metrics.threePointPercentage}%`);
    if (session.metrics.midRangePercentage) metrics.push(`Mid: ${session.metrics.midRangePercentage}%`);
    if (session.metrics.layupPercentage) metrics.push(`Layup: ${session.metrics.layupPercentage}%`);
    if (session.metrics.speed) metrics.push(`Speed: ${session.metrics.speed}s`);
    if (session.metrics.agility) metrics.push(`Agility: ${session.metrics.agility}s`);
    if (session.metrics.vertical) metrics.push(`Vert: ${session.metrics.vertical}"`);
    if (session.metrics.reactionTime) metrics.push(`React: ${session.metrics.reactionTime}ms`);
    return metrics;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Sessions</h1>
          <p className="text-muted-foreground">
            Log your practice drills and track skill improvement
          </p>
        </div>
        <TrainingDialog onClose={loadSessions} />
      </div>

      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Summary</CardTitle>
            <CardDescription>
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Shooting Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.drillType === 'Shooting' || s.drillType === 'Mixed').length}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Skills Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.drillType === 'Skills' || s.drillType === 'Mixed').length}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">This Week</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => {
                    const sessionDate = new Date(s.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return sessionDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Training Sessions Logged</CardTitle>
            <CardDescription>
              Start tracking your practice sessions to monitor skill development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Record shooting drills, speed work, agility training, and other skill metrics to see your improvement over time.
            </p>
            <TrainingDialog onClose={loadSessions} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => {
                const metrics = getMetricDisplay(session);
                return (
                  <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge>{session.drillType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      {metrics.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-sm mb-2">
                          {metrics.map((metric, idx) => (
                            <span key={idx} className="text-muted-foreground">
                              {metric}
                            </span>
                          ))}
                        </div>
                      )}
                      {session.notes && (
                        <p className="text-sm text-muted-foreground italic">{session.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(session)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteSession(session)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {editingSession && (
        <TrainingDialog editSession={editingSession} onClose={handleCloseDialog} />
      )}

      <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training session? This action cannot be undone.
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

export default TrainingStats;