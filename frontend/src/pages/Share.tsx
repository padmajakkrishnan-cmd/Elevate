import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Share2, Copy, Trash2, ExternalLink, Eye } from 'lucide-react';
import { shareApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ShareLink } from '@/types';
import { showSuccess } from '@/utils/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Share = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [deleteLink, setDeleteLink] = useState<ShareLink | null>(null);

  // Fetch share links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['shareLinks'],
    queryFn: shareApi.getAll,
    enabled: !!user,
  });

  // Create share link mutation
  const createMutation = useMutation({
    mutationFn: shareApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareLinks'] });
      showSuccess('Share link created!');
    },
  });

  // Delete share link mutation
  const deleteMutation = useMutation({
    mutationFn: shareApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareLinks'] });
      showSuccess('Share link deleted');
      setDeleteLink(null);
    },
  });

  const generateShareLink = () => {
    if (!user || !profile) return;
    createMutation.mutate();
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/report/${token}`;
    navigator.clipboard.writeText(url);
    showSuccess('Link copied to clipboard!');
  };

  const openLink = (token: string) => {
    const url = `${window.location.origin}/report/${token}`;
    window.open(url, '_blank');
  };

  const handleDelete = () => {
    if (deleteLink) {
      deleteMutation.mutate(deleteLink.id);
    }
  };

  const sortedLinks = [...links].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Share Progress</h1>
          <p className="text-gray-400">
            Share your stats and progress with parents and coaches
          </p>
        </div>
        <Button onClick={generateShareLink} disabled={createMutation.isPending}>
          <Share2 className="w-4 h-4 mr-2" />
          Create Share Link
        </Button>
      </div>

      <Card className="gradient-card-blue border-blue-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="gradient-icon-blue p-2 rounded-lg">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Shareable Links</CardTitle>
              <CardDescription className="text-gray-400">
                Generate links that allow parents and coaches to view your progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Create a shareable link that displays your profile, stats, and progress. Anyone with the link can view your report without needing to create an account.
          </p>

          {links.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No share links created yet</p>
              <Button onClick={generateShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        <Eye className="w-3 h-3 mr-1" />
                        {link.viewCount} {link.viewCount === 1 ? 'view' : 'views'}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/report/${link.token}`}
                        readOnly
                        className="font-mono text-sm bg-black/20 border-white/10 text-gray-300"
                      />
                    </div>
                    {link.lastViewed && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last viewed: {new Date(link.lastViewed).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.token)} className="hover:bg-white/10">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openLink(link.token)} className="hover:bg-white/10">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteLink(link)} className="hover:bg-white/10">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gradient-card-purple border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="font-semibold text-white">1.</span>
              <span>Click "Create Share Link" to generate a unique URL</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">2.</span>
              <span>Copy the link and share it with parents, coaches, or anyone you want to see your progress</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">3.</span>
              <span>They can view your profile, stats, and progress without creating an account</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-white">4.</span>
              <span>You can delete links anytime to revoke access</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Share Link?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete this share link. Anyone with this link will no longer be able to view your report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Share;