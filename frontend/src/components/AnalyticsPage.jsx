import { Card, CardHeader, CardTitle } from "./ui/card";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </div>
      
      <Card className="p-8 text-center">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <p className="text-muted-foreground">
            Workout analytics and insights will be available here
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}