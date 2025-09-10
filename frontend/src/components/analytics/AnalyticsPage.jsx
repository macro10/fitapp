import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import OverallProgressTab from "./tabs/OverallProgressTab";
import MuscleGroupsTab from "./tabs/MuscleGroupsTab";
import ExercisesTab from "./tabs/ExercisesTab";

export default function AnalyticsPage() {
  console.log('AnalyticsPage rendered');

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Follow your workouts over time</p>
      </div>
      
      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="muscle-groups" disabled>Muscle Groups</TabsTrigger>
          <TabsTrigger value="exercises" disabled>Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <OverallProgressTab />
        </TabsContent>

        <TabsContent value="muscle-groups">
          <MuscleGroupsTab />
        </TabsContent>

        <TabsContent value="exercises">
          <ExercisesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
