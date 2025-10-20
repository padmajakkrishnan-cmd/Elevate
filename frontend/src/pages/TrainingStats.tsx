import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const TrainingStats = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Sessions</h1>
          <p className="text-muted-foreground">
            Log your practice drills and track skill improvement
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Log Training
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Training Sessions Logged</CardTitle>
          <CardDescription>
            Start tracking your practice sessions to monitor skill development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Record shooting drills, speed work, agility training, and other skill metrics to see your improvement over time.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Your First Training Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingStats;