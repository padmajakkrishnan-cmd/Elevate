import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { profileApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileEditDialogProps {
  trigger?: React.ReactNode;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ trigger }) => {
  const { profile, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    ageGroup: '',
    sport: 'Basketball',
    heightFeet: '',
    heightInches: '',
    weight: '',
    wingspanFeet: '',
    wingspanInches: '',
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
        heightFeet: profile.heightFeet?.toString() || '',
        heightInches: profile.heightInches?.toString() || '',
        weight: profile.weight?.toString() || '',
        wingspanFeet: profile.wingspanFeet?.toString() || '',
        wingspanInches: profile.wingspanInches?.toString() || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, open]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (data) => {
      updateProfile(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showSuccess('Profile updated successfully!');
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedData = {
      name: formData.name,
      team: formData.team,
      position: formData.position,
      ageGroup: formData.ageGroup,
      sport: formData.sport,
      heightFeet: formData.heightFeet ? parseInt(formData.heightFeet) : null,
      heightInches: formData.heightInches ? parseInt(formData.heightInches) : null,
      weight: formData.weight ? parseInt(formData.weight) : null,
      wingspanFeet: formData.wingspanFeet ? parseInt(formData.wingspanFeet) : null,
      wingspanInches: formData.wingspanInches ? parseInt(formData.wingspanInches) : null,
      bio: formData.bio || null,
    };

    updateMutation.mutate(updatedData);
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
            Update your player information
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
              <Label htmlFor="heightFeet">Height (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={formData.heightFeet} onValueChange={(value) => handleChange('heightFeet', value)}>
                  <SelectTrigger id="heightFeet">
                    <SelectValue placeholder="Feet" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(feet => (
                      <SelectItem key={feet} value={feet.toString()}>{feet} ft</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.heightInches} onValueChange={(value) => handleChange('heightInches', value)}>
                  <SelectTrigger id="heightInches">
                    <SelectValue placeholder="Inches" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                      <SelectItem key={inches} value={inches.toString()}>{inches} in</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight in lbs (optional)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="150"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wingspanFeet">Wingspan (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={formData.wingspanFeet} onValueChange={(value) => handleChange('wingspanFeet', value)}>
                  <SelectTrigger id="wingspanFeet">
                    <SelectValue placeholder="Feet" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(feet => (
                      <SelectItem key={feet} value={feet.toString()}>{feet} ft</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.wingspanInches} onValueChange={(value) => handleChange('wingspanInches', value)}>
                  <SelectTrigger id="wingspanInches">
                    <SelectValue placeholder="Inches" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                      <SelectItem key={inches} value={inches.toString()}>{inches} in</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              maxLength={500}
            />
            <p className="text-xs text-gray-400">{formData.bio.length}/500 characters</p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};