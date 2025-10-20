import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

const Share = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Share Progress</h1>
        <p className="text-muted-foreground">
          Share your stats and progress with parents and coaches
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Share Your Progress</CardTitle>
              <CardDescription>
                Create shareable links for parents and coaches
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate a shareable link that allows parents and coaches to view your profile, stats, and progress without needing to create an account.
          </p>
          <Button>
            <Share2 className="w-4 h-4 mr-2" />
            Create Share Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Share;