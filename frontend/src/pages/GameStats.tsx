import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameStatsDialog } from '@/components/GameStatsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, TrendingUp, Calendar } from 'lucide-react';
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
          <h1 className="text-3xl font-bold mb-2 text-white">Game Stats</h1>
          <p className="text-gray-400">
            Track your game performance and see your progress
          </p>
        </div>
        <GameStatsDialog onClose={loadGames} />
      </div>

      {games.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="gradient-card-blue border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{calculateAverage('points')}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">PPG</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-purple border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{calculateAverage('assists')}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">APG</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-green border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{calculateAverage('rebounds')}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">RPG</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-orange border-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{calculateAverage('steals')}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">SPG</div>
            </CardContent>
          </Card>
          <Card className="gradient-card-purple border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{calculateAverage('blocks')}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">BPG</div>
            </CardContent>
          </Card>
        </div>
      )}

      {games.length === 0 ? (
        <Card className="gradient-card-blue border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="gradient-icon-blue p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Games Logged Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start tracking your game stats to see your performance trends and improvements over time.
            </p>
            <GameStatsDialog onClose={loadGames} />
          </CardContent>
        </Card>
      ) : (
        <Card className="gradient-card-blue border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white">Game History</CardTitle>
            <CardDescription className="text-gray-400">
              {games.length} {games.length === 1 ? 'game' : 'games'} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">vs {game.opponent}</h3>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {new Date(game.date).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">PTS:</span> <span className="font-semibold text-white ml-1">{game.points}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">AST:</span> <span className="font-semibold text-white ml-1">{game.assists}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">REB:</span> <span className="font-semibold text-white ml-1">{game.rebounds}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">STL:</span> <span className="font-semibold text-white ml-1">{game.steals}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">BLK:</span> <span className="font-semibold text-white ml-1">{game.blocks}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">TO:</span> <span className="font-semibold text-white ml-1">{game.turnovers}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">MIN:</span> <span className="font-semibold text-white ml-1">{game.minutes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(game)} className="hover:bg-white/10">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteGame(game)} className="hover:bg-white/10">
                      <Trash2 className="w-4 h-4 text-red-400" />
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
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Game Stats?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the game vs {deleteGame?.opponent}? This action cannot be undone.
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

export default GameStats;