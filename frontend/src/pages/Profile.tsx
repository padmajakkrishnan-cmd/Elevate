import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Target, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { profile, user } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Player Profile</h1>
        <p className="text-muted-foreground">
          Your athlete information and goals
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your player details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-semibold">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team</p>
                <p className="font-semibold">{profile.team}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Position</p>
                <p className="font-semibold">{profile.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sport</p>
                <Badge variant="secondary">{profile.sport}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age Group</p>
                <Badge variant="secondary">{profile.ageGroup} years</Badge>
              </div>
            </div>

            {(profile.height || profile.weight || profile.wingspan) && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Physical Attributes</p>
                <div className="grid grid-cols-3 gap-4">
                  {profile.height && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Height</p>
                      <p className="font-semibold">{profile.height}</p>
                    </div>
                  )}
                  {profile.weight && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Weight</p>
                      <p className="font-semibold">{profile.weight}</p>
                    </div>
                  )}
                  {profile.wingspan && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Wingspan</p>
                      <p className="font-semibold">{profile.wingspan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your progress at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Logged</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training Sessions</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>What you're working towards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{profile.goals}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;