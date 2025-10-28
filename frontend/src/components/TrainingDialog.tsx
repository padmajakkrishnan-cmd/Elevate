import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { TrainingSession } from '@/types';
import { trainingSessionsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TrainingDialogProps {
  editSession?: TrainingSession;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const TrainingDialog: React.FC<TrainingDialogProps> = ({ editSession, onClose, trigger }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    drillType: 'Shooting',
    freeThrowPercentage: '',
    threePointPercentage: '',
    midRangePercentage: '',
    layupPercentage: '',
    speed: '',
    agility: '',
    vertical: '',
    reactionTime: '',
    notes: '',
  });

  useEffect(() => {
    if (editSession) {
      setFormData({
        date: editSession.date,
        drillType: editSession.drillType,
        freeThrowPercentage: editSession.metrics.freeThrowPercentage?.toString() || '',
        threePointPercentage: editSession.metrics.threePointPercentage?.toString() || '',
        midRangePercentage: editSession.metrics.midRangePercentage?.toString() || '',
        layupPercentage: editSession.metrics.layupPercentage?.toString() || '',
        speed: editSession.metrics.speed?.toString() || '',
        agility: editSession.metrics.agility?.toString() || '',
        vertical: editSession.metrics.vertical?.toString() || '',
        reactionTime: editSession.metrics.reactionTime?.toString() || '',
        notes: editSession.notes || '',
      });
      setOpen(true);
    }
  }, [editSession]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: trainingSessionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
      showSuccess('Training session logged!');
      handleClose();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainingSessionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
      showSuccess('Training session updated!');
      handleClose();
    },
  });

  const handleClose = () => {
    setOpen(false);
    resetForm();
    onClose?.();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      drillType: 'Shooting',
      freeThrowPercentage: '',
      threePointPercentage: '',
      midRangePercentage: '',
      layupPercentage: '',
      speed: '',
      agility: '',
      vertical: '',
      reactionTime: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const sessionData = {
      date: formData.date,
      drillType: formData.drillType,
      metrics: {
        ...(formData.freeThrowPercentage && { freeThrowPercentage: Number(formData.freeThrowPercentage) }),
        ...(formData.threePointPercentage && { threePointPercentage: Number(formData.threePointPercentage) }),
        ...(formData.midRangePercentage && { midRangePercentage: Number(formData.midRangePercentage) }),
        ...(formData.layupPercentage && { layupPercentage: Number(formData.layupPercentage) }),
        ...(formData.speed && { speed: Number(formData.speed) }),
        ...(formData.agility && { agility: Number(formData.agility) }),
        ...(formData.vertical && { vertical: Number(formData.vertical) }),
        ...(formData.reactionTime && { reactionTime: Number(formData.reactionTime) }),
      },
      notes: formData.notes || undefined,
    };

    if (editSession) {
      updateMutation.mutate({ id: editSession.id, data: sessionData });
    } else {
      createMutation.mutate(sessionData);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'drillType') {
      // Clear metrics when drill type changes
      setFormData(prev => ({
        ...prev,
        drillType: value,
        // Clear all metrics
        freeThrowPercentage: '',
        threePointPercentage: '',
        midRangePercentage: '',
        layupPercentage: '',
        speed: '',
        agility: '',
        vertical: '',
        reactionTime: '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const isShootingDrill = formData.drillType === 'Shooting';
  const isSkillDrill = formData.drillType === 'Skills';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Training
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editSession ? 'Edit Training Session' : 'Log Training Session'}</DialogTitle>
          <DialogDescription>
            {editSession ? 'Update your training metrics' : 'Record your practice session'}
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
              <Label htmlFor="drillType">Drill Type *</Label>
              <Select value={formData.drillType} onValueChange={(value) => handleChange('drillType', value)} required>
                <SelectTrigger id="drillType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shooting">Shooting</SelectItem>
                  <SelectItem value="Skills">Skills & Conditioning</SelectItem>
                  <SelectItem value="Mixed">Mixed Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(isShootingDrill || formData.drillType === 'Mixed') && (
            <div>
              <h3 className="font-semibold mb-3">Shooting Metrics (%)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeThrow">Free Throw %</Label>
                  <Input
                    id="freeThrow"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.freeThrowPercentage}
                    onChange={(e) => handleChange('freeThrowPercentage', e.target.value)}
                    placeholder="85"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threePoint">3-Point %</Label>
                  <Input
                    id="threePoint"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.threePointPercentage}
                    onChange={(e) => handleChange('threePointPercentage', e.target.value)}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="midRange">Mid-Range %</Label>
                  <Input
                    id="midRange"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.midRangePercentage}
                    onChange={(e) => handleChange('midRangePercentage', e.target.value)}
                    placeholder="55"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="layup">Layup %</Label>
                  <Input
                    id="layup"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.layupPercentage}
                    onChange={(e) => handleChange('layupPercentage', e.target.value)}
                    placeholder="90"
                  />
                </div>
              </div>
            </div>
          )}

          {(isSkillDrill || formData.drillType === 'Mixed') && (
            <div>
              <h3 className="font-semibold mb-3">Skill Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed (sec)</Label>
                  <Input
                    id="speed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.speed}
                    onChange={(e) => handleChange('speed', e.target.value)}
                    placeholder="5.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agility">Agility (sec)</Label>
                  <Input
                    id="agility"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.agility}
                    onChange={(e) => handleChange('agility', e.target.value)}
                    placeholder="8.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vertical">Vertical (in)</Label>
                  <Input
                    id="vertical"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.vertical}
                    onChange={(e) => handleChange('vertical', e.target.value)}
                    placeholder="28"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reactionTime">Reaction (ms)</Label>
                  <Input
                    id="reactionTime"
                    type="number"
                    min="0"
                    value={formData.reactionTime}
                    onChange={(e) => handleChange('reactionTime', e.target.value)}
                    placeholder="250"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="How did the session go? Any observations?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editSession ? 'Update Session' : 'Log Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};