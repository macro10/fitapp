import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";
import { LineChart } from "lucide-react";
import { subMonths } from "date-fns";
import { getWeeklyVolumeAnalytics } from "../../../api";

export default function VolumeProgressCard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    latest: 0,       // week-to-date total volume
    workouts: 0,     // workouts so far this week
    avg: 0,          // avg volume per workout this week
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const startDate = subMonths(new Date(), 6).toISOString();
        const endDate = new Date().toISOString();
        const resp = await getWeeklyVolumeAnalytics(startDate, endDate);
        const arr = resp?.weekly_volumes || [];

        if (!arr.length) {
          if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0 });
          return;
        }

        // Current (possibly in-progress) week
        const current = arr[arr.length - 1] || {};
        const latest = Number(current.totalVolume || 0);
        const avg = Number(current.avgVolumePerWorkout || 0);
        const workouts =
          current.workoutCount ?? (avg ? Math.round(latest / avg) : 0);

        if (!cancelled) {
          setStats({ latest, workouts, avg });
        }
      } catch {
        if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toK = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);

  return (
    <Card className="pb-4">
      <CardHeader className="pb-0">
        {/* Two-column grid: [icon] [text + metrics] */}
        <div className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-2">
          {/* Col 1: icon */}
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <LineChart className="h-5 w-5 text-foreground/70" />
          </div>

          {/* Col 2: title + subtitle */}
          <div className="space-y-1">
            <CardTitle className="text-2xl">Strength</CardTitle>
            <p className="text-muted-foreground">Your workout volume by week</p>
          </div>

          {/* Row 2 in Col 2: number aligned with title; pills flush right */}
          <div className="col-start-2 flex items-baseline justify-between gap-3 pr-4">
            <div className="text-4xl md:text-5xl font-semibold leading-tight tabular-nums tracking-tight">
              {loading ? "—" : stats.latest.toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs px-2.5 py-1 rounded-full bg-muted/20 text-foreground/80">
                {loading ? "Workouts —" : `Workouts ${stats.workouts}`}
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full bg-muted/20 text-foreground/80">
                {loading ? "Avg —" : `Avg ${toK(Math.round(stats.avg))}`}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-10">
        <WeeklyVolumeChart />
      </CardContent>
    </Card>
  );
}
