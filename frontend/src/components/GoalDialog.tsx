import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { Goal } from '@/types';
import { goalsStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';

interface GoalDialogProps {
  editGoal?: Goal;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const GoalDialog: React.FC<GoalDialogProps> = ({ editGoal, onClose, trigger }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'monthly' as 'weekly' | 'monthly' | 'seasonal',
    category: 'performance' as 'performance' | 'training' | 'skill',
    title: '',
    description: '',
    targetValue: '',
    metric: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (editGoal) {
      setFormData({
        type: editGoal.type,
        category: editGoal.category,
        title: editGoal.title,
        description: editGoal.description,
        targetValue: editGoal.targetValue?.toString() || '',
        metric: editGoal.metric || '',
        startDate: editGoal.startDate,
        endDate: editGoal.endDate,
      });
      setOpen(true);
    }
  }, [editGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const goalData: Goal = {
      id: editGoal?.id || crypto.randomUUID(),
      userId: user.id,
      type: formData.type,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      targetValue: formData.targetValue ? Number(formData.targetValue) : undefined,
      currentValue: editGoal?.currentValue || 0,
      metric: formData.metric || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: editGoal?.status || 'active',
      createdAt: editGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editGoal) {
      goalsStorage.update(editGoal.id, goalData);
      showSuccess('Goal updated!');
    } else {
      goalsStorage.add(goalData);
      showSuccess('Goal created!');
    }

    setOpen(false);
    resetForm();
    onClose?.();
  };

  const resetForm = () => {
    setFormData({
      type: 'monthly',
      category: 'performance',
      title: '',
      description: '',
      targetValue: '',
      metric: '',
      startDate: '',
      endDate: '',
    });
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
            Set Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
          <DialogDescription>
            {editGoal ? 'Update your goal' : 'Define what you want to achieve'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Time Period *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="skill">Skill Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Improve average PPG"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Increase my points per game from 4 to 8 over the next 6 weeks"
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value (optional)</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.1"
                value={formData.targetValue}
                onChange={(e) => handleChange('targetValue', e.target.value)}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric (optional)</Label>
              <Input
                id="metric"
                value={formData.metric}
                onChange={(e) => handleChange('metric', e.target.value)}
                placeholder="e.g., PPG, 3PT%, practices per week"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};