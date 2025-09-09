import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";
import { LineChart } from "lucide-react";

export default function VolumeProgressCard() {
  return (
    <Card className="pb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 p-2 rounded-md">
            <LineChart className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Volume Progress</CardTitle>
            <p className="text-muted-foreground">
              Track your total workout volume over time
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <WeeklyVolumeChart />
      </CardContent>
    </Card>
  );
}
