import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";

export default function VolumeProgressCard() {
  return (
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
  );
}
