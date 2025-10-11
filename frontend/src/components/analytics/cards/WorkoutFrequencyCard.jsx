import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyFrequencyChart from "../charts/WeeklyFrequencyChart";

export default function WorkoutFrequencyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Frequency</CardTitle>
        <p className="text-muted-foreground">
          Workouts per week
        </p>
      </CardHeader>
      <CardContent>
        <WeeklyFrequencyChart />
      </CardContent>
    </Card>
  );
}
