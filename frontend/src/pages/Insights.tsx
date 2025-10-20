import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

const Insights = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          Personalized analysis and recommendations based on your performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>No Insights Yet</CardTitle>
              <CardDescription>
                Log more games and training sessions to unlock AI-powered insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Once you've logged at least a few games and training sessions, our AI will analyze your performance and provide personalized insights, highlight improvements, and suggest areas to focus on.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;