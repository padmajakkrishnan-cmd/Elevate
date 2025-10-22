import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { User, Mail, Target, TrendingUp, Trash2, Edit } from 'lucide-react';
import { storage } from '@/lib/storage';
import { showSuccess } from '@/utils/toast';

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = () => {
    storage.clear();
    showSuccess('Account deleted successfully');
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Player Profile</h1>
          <p className="text-gray-400">
            Your athlete information and goals
          </p>
        </div>
        <div className="flex gap-2">
          <ProfileEditDialog />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 gradient-card-blue border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
            <CardDescription className="text-gray-400">Your player details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                <p className="font-semibold text-white">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-semibold text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Team</p>
                <p className="font-semibold text-white">{profile.team}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Position</p>
                <p className="font-semibold text-white">{profile.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Sport</p>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{profile.sport}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Age Group</p>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{profile.ageGroup} years</Badge>
              </div>
            </div>

            {(profile.height || profile.weight || profile.wingspan) && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold mb-3 text-white">Physical Attributes</p>
                <div className="grid grid-cols-3 gap-4">
                  {profile.height && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Height</p>
                      <p className="font-semibold text-white">{profile.height}</p>
                    </div>
                  )}
                  {profile.weight && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Weight</p>
                      <p className="font-semibold text-white">{profile.weight}</p>
                    </div>
                  )}
                  {profile.wingspan && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Wingspan</p>
                      <p className="font-semibold text-white">{profile.wingspan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.bio && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold mb-2 text-white">Bio</p>
                <p className="text-gray-400 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card-purple border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Stats</CardTitle>
            <CardDescription className="text-gray-400">Your progress at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="gradient-icon-blue p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Games Logged</p>
                <p className="text-xl font-bold text-white">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="gradient-icon-purple p-2 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Training Sessions</p>
                <p className="text-xl font-bold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card-green border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">Your Goals</CardTitle>
          <CardDescription className="text-gray-400">What you're working towards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 whitespace-pre-wrap">{profile.goals}</p>
        </CardContent>
      </Card>

      <Card className="gradient-card-orange border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-gray-400">
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-500/30 rounded-lg bg-red-500/5">
            <div>
              <p className="font-semibold text-white">Delete Account</p>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete your account and all your data including profile, stats, goals, training sessions, and notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;