import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import WeeklyVolumeChart from "./analytics/charts/WeeklyVolumeChart";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </div>
      
      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overall">Overall Progress</TabsTrigger>
          <TabsTrigger value="muscle-groups" disabled>Muscle Groups</TabsTrigger>
          <TabsTrigger value="exercises" disabled>Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Volume Progress</CardTitle>
                <p className="text-muted-foreground">
                  Track your total workout volume over time
                </p>
              </CardHeader>
              <CardContent>
                <WeeklyVolumeChart />
              </CardContent>
            </Card>

            {/* Placeholder for future overall analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Workouts</CardTitle>
                  <p className="text-muted-foreground">
                    Your strongest performances
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Coming Soon
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workout Frequency</CardTitle>
                  <p className="text-muted-foreground">
                    Your workout consistency
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Coming Soon
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="muscle-groups">
          <Card>
            <CardHeader>
              <CardTitle>Muscle Group Analysis</CardTitle>
              <p className="text-muted-foreground">
                Coming soon: Analyze progress by muscle group
              </p>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              This feature is coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Analysis</CardTitle>
              <p className="text-muted-foreground">
                Coming soon: Track individual exercise progress
              </p>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              This feature is coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}