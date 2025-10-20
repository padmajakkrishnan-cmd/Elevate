import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameStatsDialog } from '@/components/GameStatsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, TrendingUp } from 'lucide-react';
import { gameStatsStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import type { GameStat } from '@/types';
import { showSuccess } from '@/utils/toast';

const GameStats = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<GameStat[]>([]);
  const [editingGame, setEditingGame] = useState<GameStat | undefined>();
  const [deleteGame, setDeleteGame] = useState<GameStat | null>(null);

  const loadGames = () => {
    const allGames = gameStatsStorage.getAll();
    const userGames = allGames.filter(g => g.userId === user?.id);
    setGames(userGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadGames();
  }, [user]);

  const handleDelete = () => {
    if (deleteGame) {
      gameStatsStorage.delete(deleteGame.id);
      showSuccess('Game deleted');
      loadGames();
      setDeleteGame(null);
    }
  };

  const handleEdit = (game: GameStat) => {
    setEditingGame(game);
  };

  const handleCloseDialog = () => {
    setEditingGame(undefined);
    loadGames();
  };

  const calculateAverage = (stat: keyof Pick<GameStat, 'points' | 'assists' | 'rebounds' | 'steals' | 'blocks'>) => {
    if (games.length === 0) return 0;
    const sum = games.reduce((acc, game) => acc + game[stat], 0);
    return (sum / games.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Game Stats</h1>
          <p className="text-muted-foreground">
            Track your game performance and see your progress
          </p>
        </div>
        <GameStatsDialog onClose={loadGames} />
      </div>

      {games.length > 0 && (
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">PPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverage('points')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">APG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverage('assists')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">RPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverage('rebounds')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">SPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverage('steals')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">BPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverage('blocks')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {games.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Games Logged Yet</CardTitle>
            <CardDescription>
              Start tracking your game stats to see your performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click "Log Game" to record your first game stats including points, assists, rebounds, and more.
            </p>
            <GameStatsDialog onClose={loadGames} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Game History</CardTitle>
            <CardDescription>
              {games.length} {games.length === 1 ? 'game' : 'games'} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">vs {game.opponent}</h3>
                      <Badge variant="outline">{new Date(game.date).toLocaleDateString()}</Badge>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">PTS:</span> <span className="font-semibold">{game.points}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">AST:</span> <span className="font-semibold">{game.assists}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">REB:</span> <span className="font-semibold">{game.rebounds}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">STL:</span> <span className="font-semibold">{game.steals}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">BLK:</span> <span className="font-semibold">{game.blocks}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TO:</span> <span className="font-semibold">{game.turnovers}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MIN:</span> <span className="font-semibold">{game.minutes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(game)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteGame(game)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingGame && (
        <GameStatsDialog editGame={editingGame} onClose={handleCloseDialog} />
      )}

      <AlertDialog open={!!deleteGame} onOpenChange={() => setDeleteGame(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game Stats?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the game vs {deleteGame?.opponent}? This action cannot be undone.
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

export default GameStats;