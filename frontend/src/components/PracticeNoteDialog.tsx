import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { PracticeNote } from '@/types';
import { practiceNotesStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';

interface PracticeNoteDialogProps {
  editNote?: PracticeNote;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const PracticeNoteDialog: React.FC<PracticeNoteDialogProps> = ({ editNote, onClose, trigger }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: 'practice' as 'practice' | 'workout' | 'nutrition',
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    if (editNote) {
      setFormData({
        date: editNote.date,
        type: editNote.type,
        title: editNote.title,
        content: editNote.content,
        tags: editNote.tags?.join(', ') || '',
      });
      setOpen(true);
    }
  }, [editNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const noteData: PracticeNote = {
      id: editNote?.id || crypto.randomUUID(),
      userId: user.id,
      date: formData.date,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      createdAt: editNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editNote) {
      practiceNotesStorage.update(editNote.id, noteData);
      showSuccess('Note updated!');
    } else {
      practiceNotesStorage.add(noteData);
      showSuccess('Note added!');
    }

    setOpen(false);
    resetForm();
    onClose?.();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      type: 'practice',
      title: '',
      content: '',
      tags: '',
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
            Add Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editNote ? 'Edit Note' : 'Add Practice Note'}</DialogTitle>
          <DialogDescription>
            {editNote ? 'Update your note' : 'Record practice observations, workouts, or nutrition notes'}
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
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice Notes</SelectItem>
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Morning shooting practice, Leg day workout, Pre-game meal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Notes *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Describe what you did, how you felt, what you learned..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="e.g., shooting, conditioning, recovery (comma-separated)"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editNote ? 'Update Note' : 'Add Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};