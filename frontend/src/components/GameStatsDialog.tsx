import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { GameStat } from '@/types';
import { gameStatsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface GameStatsDialogProps {
  editGame?: GameStat;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const GameStatsDialog: React.FC<GameStatsDialogProps> = ({ editGame, onClose, trigger }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    opponent: '',
    points: '',
    assists: '',
    rebounds: '',
    steals: '',
    blocks: '',
    turnovers: '',
    minutes: '',
  });

  useEffect(() => {
    if (editGame) {
      setFormData({
        date: editGame.date,
        opponent: editGame.opponent,
        points: editGame.points.toString(),
        assists: editGame.assists.toString(),
        rebounds: editGame.rebounds.toString(),
        steals: editGame.steals.toString(),
        blocks: editGame.blocks.toString(),
        turnovers: editGame.turnovers.toString(),
        minutes: editGame.minutes.toString(),
      });
      setOpen(true);
    }
  }, [editGame]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: gameStatsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameStats'] });
      showSuccess('Game stats logged!');
      handleClose();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => gameStatsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameStats'] });
      showSuccess('Game stats updated!');
      handleClose();
    },
  });

  const handleClose = () => {
    setOpen(false);
    setFormData({
      date: '',
      opponent: '',
      points: '',
      assists: '',
      rebounds: '',
      steals: '',
      blocks: '',
      turnovers: '',
      minutes: '',
    });
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const gameData = {
      date: formData.date,
      opponent: formData.opponent,
      points: Number(formData.points),
      assists: Number(formData.assists),
      rebounds: Number(formData.rebounds),
      steals: Number(formData.steals),
      blocks: Number(formData.blocks),
      turnovers: Number(formData.turnovers),
      minutes: Number(formData.minutes),
    };

    if (editGame) {
      updateMutation.mutate({ id: editGame.id, data: gameData });
    } else {
      createMutation.mutate(gameData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Game
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGame ? 'Edit Game Stats' : 'Log Game Stats'}</DialogTitle>
          <DialogDescription>
            {editGame ? 'Update your game performance' : 'Record your game performance'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opponent">Opponent *</Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) => handleChange('opponent', e.target.value)}
                placeholder="Team name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => handleChange('points', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assists">Assists *</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                value={formData.assists}
                onChange={(e) => handleChange('assists', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rebounds">Rebounds *</Label>
              <Input
                id="rebounds"
                type="number"
                min="0"
                value={formData.rebounds}
                onChange={(e) => handleChange('rebounds', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="steals">Steals *</Label>
              <Input
                id="steals"
                type="number"
                min="0"
                value={formData.steals}
                onChange={(e) => handleChange('steals', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blocks">Blocks *</Label>
              <Input
                id="blocks"
                type="number"
                min="0"
                value={formData.blocks}
                onChange={(e) => handleChange('blocks', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnovers">Turnovers *</Label>
              <Input
                id="turnovers"
                type="number"
                min="0"
                value={formData.turnovers}
                onChange={(e) => handleChange('turnovers', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes *</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                value={formData.minutes}
                onChange={(e) => handleChange('minutes', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editGame ? 'Update Game' : 'Log Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};