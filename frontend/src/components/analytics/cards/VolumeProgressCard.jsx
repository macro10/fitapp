import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";
import { LineChart, Dumbbell, TrendingUp, TrendingDown } from "lucide-react";
import { subMonths } from "date-fns";
import { getWeeklyVolumeAnalytics } from "../../../api";

export default function VolumeProgressCard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    latest: 0,     // current week-to-date total
    workouts: 0,   // workouts so far this week
    avg: 0,        // avg vol/workout this week
    prevAvg: 0,    // last week's avg vol/workout
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
          if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0, prevAvg: 0 });
          return;
        }

        // Current (possibly in-progress) week
        const current = arr[arr.length - 1] || {};
        const latest = Number(current.totalVolume || 0);
        const avg = Number(current.avgVolumePerWorkout || 0);
        const workouts =
          current.workoutCount ?? (avg ? Math.round(latest / avg) : 0);

        // Last completed week (for avg comparison)
        const prev = arr[arr.length - 2] || {};
        const prevAvg = Number(prev.avgVolumePerWorkout || 0);

        if (!cancelled) {
          setStats({ latest, workouts, avg, prevAvg });
        }
      } catch {
        if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0, prevAvg: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toK = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);

  // Shared chip styling for visual consistency
  const pillBase =
    "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium tabular-nums ring-1 transition-colors duration-200";

  // % delta vs last week's average (for tooltip and future use)
  const avgDeltaPct = stats.prevAvg
    ? Math.round(((stats.avg - stats.prevAvg) / stats.prevAvg) * 100)
    : 0;

  // Avg pill tone vs last week's avg
  const avgPillClass = (() => {
    const prev = stats.prevAvg;
    if (!prev) return "bg-muted/20 text-foreground/70 ring-1 ring-white/5";
    const pct = ((stats.avg - prev) / prev) * 100;
    if (pct > 0) return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25";
    if (pct <= -10) return "bg-red-500/15 text-red-300 ring-1 ring-red-400/25";
    return "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-400/20"; // within 0–10% lower
  })();

  // Choose icon based on delta (down arrow if decreased)
  const AvgIcon = (() => {
    const prev = stats.prevAvg;
    if (!prev) return TrendingUp;
    const pct = ((stats.avg - prev) / prev) * 100;
    return pct > 0 ? TrendingUp : TrendingDown;
  })();

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
          <div className="col-start-2 flex items-baseline justify-between gap-2 sm:gap-3 pr-4">
            <div className="text-4xl md:text-5xl font-semibold leading-tight tabular-nums tracking-tight">
              {loading ? "—" : stats.latest.toLocaleString()}
            </div>

            <div className="flex items-center gap-3">
              {/* Workouts label + accent-tinted pill */}
              <span className="hidden sm:inline text-sm text-muted-foreground">Workouts</span>
              <div
                className={`${pillBase} bg-emerald-500/15 text-emerald-300 ring-emerald-400/25`}
                title="Workouts completed this week"
              >
                <Dumbbell className="h-3.5 w-3.5 -ml-0.5 opacity-80" />
                {loading ? "—" : stats.workouts}
              </div>

              {/* Avg label + conditional colored pill */}
              <span className="hidden sm:inline text-sm text-muted-foreground">Average</span>
              <div
                className={`${pillBase} ${avgPillClass}`}
                title={
                  stats.prevAvg
                    ? `${avgDeltaPct > 0 ? "+" : ""}${avgDeltaPct}% vs last week`
                    : "Avg volume per workout this week"
                }
              >
                <AvgIcon className="h-3.5 w-3.5 -ml-0.5 opacity-80" />
                {loading ? "—" : toK(Math.round(stats.avg))}
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
