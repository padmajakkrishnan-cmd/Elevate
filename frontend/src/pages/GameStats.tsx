import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const GameStats = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Game Stats</h1>
          <p className="text-muted-foreground">
            Track your game performance and see your progress
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Log Game
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Games Logged Yet</CardTitle>
          <CardDescription>
            Start tracking your game stats to see your performance trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Click "Log Game" to record your first game stats including points, assists, rebounds, and more.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Your First Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStats;