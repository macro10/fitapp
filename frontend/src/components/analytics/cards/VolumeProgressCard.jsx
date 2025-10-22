import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";
import { LineChart } from "lucide-react";

export default function VolumeProgressCard() {
  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50 pb-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <CardHeader className="pb-0">
        <div className="grid grid-cols-[36px_1fr] gap-x-3">
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <LineChart className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Weekly Volume</CardTitle>
            <p className="text-muted-foreground">Total and average per week</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <WeeklyVolumeChart />
      </CardContent>
    </Card>
  );
}