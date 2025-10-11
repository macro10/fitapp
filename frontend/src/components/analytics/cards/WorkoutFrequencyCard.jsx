import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyFrequencyChart from "../charts/WeeklyFrequencyChart";
import { BarChart } from "lucide-react";

export default function WorkoutFrequencyCard() {
  return (
    <Card className="pb-4">
      <CardHeader className="pb-0">
        <div className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-2">
          {/* Icon */}
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-foreground/70" />
          </div>

          {/* Title + subtitle */}
          <div className="space-y-1">
            <CardTitle className="text-2xl">Weekly Sessions</CardTitle>
            <p className="text-muted-foreground">Workouts per week</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-10">
        <WeeklyFrequencyChart />
      </CardContent>
    </Card>
  );
}
