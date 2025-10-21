import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Share2, Copy, Trash2, ExternalLink, Eye } from 'lucide-react';
import { shareLinksStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import type { ShareLink } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

const Share = () => {
  const { user, profile } = useAuth();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [deleteLink, setDeleteLink] = useState<ShareLink | null>(null);

  const loadLinks = () => {
    const allLinks = shareLinksStorage.getAll();
    const userLinks = allLinks.filter(l => l.userId === user?.id);
    setLinks(userLinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadLinks();
  }, [user]);

  const generateShareLink = () => {
    if (!user || !profile) return;

    const token = crypto.randomUUID();
    const newLink: ShareLink = {
      id: crypto.randomUUID(),
      token,
      userId: user.id,
      playerName: profile.name,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };

    shareLinksStorage.add(newLink);
    showSuccess('Share link created!');
    loadLinks();
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
      shareLinksStorage.delete(deleteLink.id);
      showSuccess('Share link deleted');
      loadLinks();
      setDeleteLink(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Share Progress</h1>
          <p className="text-muted-foreground">
            Share your stats and progress with parents and coaches
          </p>
        </div>
        <Button onClick={generateShareLink}>
          <Share2 className="w-4 h-4 mr-2" />
          Create Share Link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Shareable Links</CardTitle>
              <CardDescription>
                Generate links that allow parents and coaches to view your progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Create a shareable link that displays your profile, stats, and progress. Anyone with the link can view your report without needing to create an account.
          </p>

          {links.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No share links created yet</p>
              <Button onClick={generateShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        {link.viewCount} {link.viewCount === 1 ? 'view' : 'views'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/report/${link.token}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                    </div>
                    {link.lastViewed && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last viewed: {new Date(link.lastViewed).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.token)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openLink(link.token)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteLink(link)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>Click "Create Share Link" to generate a unique URL</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>Copy the link and share it with parents, coaches, or anyone you want to see your progress</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>They can view your profile, stats, and progress without creating an account</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">4.</span>
              <span>You can delete links anytime to revoke access</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this share link. Anyone with this link will no longer be able to view your report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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