import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";

export default function VolumeProgressCard() {
  return (
    <Card className="pb-4">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Volume Progress</CardTitle>
          <p className="text-muted-foreground">
            Track your total workout volume over time
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <WeeklyVolumeChart />
      </CardContent>
    </Card>
  );
}
