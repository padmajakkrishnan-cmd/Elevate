import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import type { PlayerProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';

interface ProfileEditDialogProps {
  trigger?: React.ReactNode;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ trigger }) => {
  const { profile, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    ageGroup: '',
    sport: 'Basketball',
    height: '',
    weight: '',
    wingspan: '',
    goals: '',
    bio: '',
  });

  useEffect(() => {
    if (profile && open) {
      setFormData({
        name: profile.name,
        team: profile.team,
        position: profile.position,
        ageGroup: profile.ageGroup,
        sport: profile.sport,
        height: profile.height || '',
        weight: profile.weight || '',
        wingspan: profile.wingspan || '',
        goals: profile.goals,
        bio: profile.bio || '',
      });
    }
  }, [profile, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedProfile: PlayerProfile = {
      ...profile,
      name: formData.name,
      team: formData.team,
      position: formData.position,
      ageGroup: formData.ageGroup,
      sport: formData.sport,
      height: formData.height || undefined,
      weight: formData.weight || undefined,
      wingspan: formData.wingspan || undefined,
      goals: formData.goals,
      bio: formData.bio || undefined,
      updatedAt: new Date().toISOString(),
    };

    updateProfile(updatedProfile);
    showSuccess('Profile updated successfully!');
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your player information and goals
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Jordan Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team *</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => handleChange('team', e.target.value)}
                placeholder="Warriors U14"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Point Guard"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select value={formData.ageGroup} onValueChange={(value) => handleChange('ageGroup', value)} required>
                <SelectTrigger id="ageGroup">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-10">8-10 years</SelectItem>
                  <SelectItem value="11-12">11-12 years</SelectItem>
                  <SelectItem value="13-14">13-14 years</SelectItem>
                  <SelectItem value="15-16">15-16 years</SelectItem>
                  <SelectItem value="17-18">17-18 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select value={formData.sport} onValueChange={(value) => handleChange('sport', value)} required>
                <SelectTrigger id="sport">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Soccer">Soccer</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Baseball">Baseball</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                  <SelectItem value="Track">Track & Field</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (optional)</Label>
              <Input
                id="height"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="5'10&quot;"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (optional)</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="150 lbs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wingspan">Wingspan (optional)</Label>
              <Input
                id="wingspan"
                value={formData.wingspan}
                onChange={(e) => handleChange('wingspan', e.target.value)}
                placeholder="6'0&quot;"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your playing style, achievements..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Your Goals *</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => handleChange('goals', e.target.value)}
              placeholder="What do you want to achieve? (e.g., Make varsity team, improve 3-point shooting, increase vertical jump)"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};