import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlayerProfile } from '@/types';
import { showSuccess } from '@/utils/toast';
import { TrendingUp } from 'lucide-react';

const ProfileCreate = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const profile: PlayerProfile = {
      userId: user.id,
      ...formData,
      photos: [],
      videos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateProfile(profile);
    showSuccess('Profile created! Welcome to Elevate!');
    navigate('/dashboard');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold">Create Your Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Let's get to know you! This information helps us track your progress.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
            <CardDescription>
              Tell us about yourself and your athletic goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button type="submit" className="w-full" size="lg">
                Create Profile & Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCreate;