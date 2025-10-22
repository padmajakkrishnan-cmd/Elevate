import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrainingDialog } from '@/components/TrainingDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Target } from 'lucide-react';
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

  const shootingSessions = sessions.filter(s => s.drillType === 'Shooting' || s.drillType === 'Mixed').length;
  const skillsSessions = sessions.filter(s => s.drillType === 'Skills' || s.drillType === 'Mixed').length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = sessions.filter(s => new Date(s.date) >= weekAgo).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Training Sessions</h1>
          <p className="text-gray-400">
            Log your practice drills and track skill improvement
          </p>
        </div>
        <TrainingDialog onClose={loadSessions} />
      </div>

      {sessions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-card-blue border-blue-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{shootingSessions}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Shooting Sessions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card-purple border-purple-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{skillsSessions}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Skills Sessions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card-green border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{thisWeek}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">This Week</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {sessions.length === 0 ? (
        <Card className="gradient-card-purple border-purple-500/20">
          <CardContent className="p-8 text-center">
            <div className="gradient-icon-purple p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Training Sessions Logged</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start tracking your practice sessions to monitor skill development and see improvement over time.
            </p>
            <TrainingDialog onClose={loadSessions} />
          </CardContent>
        </Card>
      ) : (
        <Card className="gradient-card-purple border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Session History</CardTitle>
            <CardDescription className="text-gray-400">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => {
                const metrics = getMetricDisplay(session);
                return (
                  <div key={session.id} className="flex items-start justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {session.drillType}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      {metrics.length > 0 && (
                        <div className="flex flex-wrap gap-3 text-sm mb-2">
                          {metrics.map((metric, idx) => (
                            <span key={idx} className="text-gray-300">
                              {metric}
                            </span>
                          ))}
                        </div>
                      )}
                      {session.notes && (
                        <p className="text-sm text-gray-400 italic mt-2">{session.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(session)} className="hover:bg-white/10">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteSession(session)} className="hover:bg-white/10">
                        <Trash2 className="w-4 h-4 text-red-400" />
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
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Training Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this training session? This action cannot be undone.
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

export default TrainingStats;