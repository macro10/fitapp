// frontend/src/components/analytics/cards/CurrentWeekCard.jsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import { Dumbbell, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { subMonths } from "date-fns";
import { getWeeklyVolumeAnalytics } from "../../../api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

export default function CurrentWeekCard() {
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

        const current = arr[arr.length - 1] || {};
        const latest = Number(current.totalVolume || 0);
        const avg = Number(current.avgVolumePerWorkout || 0);
        const workouts = current.workoutCount ?? (avg ? Math.round(latest / avg) : 0);

        const prev = arr[arr.length - 2] || {};
        const prevAvg = Number(prev.avgVolumePerWorkout || 0);

        if (!cancelled) setStats({ latest, workouts, avg, prevAvg });
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

  const pillBase =
    "flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium tabular-nums ring-1 transition-colors duration-200";

  const avgDeltaPct = stats.prevAvg
    ? Math.round(((stats.avg - stats.prevAvg) / stats.prevAvg) * 100)
    : 0;

  const avgPillClass = (() => {
    const prev = stats.prevAvg;
    if (!prev) return "bg-muted/20 text-foreground/70 ring-1 ring-white/5";
    const pct = ((stats.avg - prev) / prev) * 100;
    if (pct > 0) return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25";
    if (pct <= -10) return "bg-red-500/15 text-red-300 ring-1 ring-red-400/25";
    return "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-400/20";
  })();

  const AvgIcon = (() => {
    const prev = stats.prevAvg;
    if (!prev) return TrendingUp;
    const pct = ((stats.avg - prev) / prev) * 100;
    return pct > 0 ? TrendingUp : TrendingDown;
  })();

  return (
    <TooltipProvider>
      <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          aria-hidden
        />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <CardTitle className="text-2xl">This Week</CardTitle>
                <p className="text-muted-foreground">Volume, workouts, average</p>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-4xl md:text-5xl font-semibold leading-tight tabular-nums tracking-tight cursor-help">
                  {loading ? "—" : stats.latest.toLocaleString()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Workout Volume This Week</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-3 flex items-center justify-end gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">Workouts</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${pillBase} bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 cursor-help`}
                  title="Workouts completed this week"
                >
                  <Dumbbell className="h-3.5 w-3.5 -ml-0.5 opacity-80" />
                  {loading ? "—" : stats.workouts}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Workouts Completed This Week</p>
              </TooltipContent>
            </Tooltip>

            <span className="hidden sm:inline text-sm text-muted-foreground">Average</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${pillBase} ${avgPillClass} cursor-help`}
                  title={
                    stats.prevAvg
                      ? `${avgDeltaPct > 0 ? "+" : ""}${avgDeltaPct}% vs last week`
                      : "Avg volume per workout this week"
                  }
                >
                  <AvgIcon className="h-3.5 w-3.5 -ml-0.5 opacity-80" />
                  {loading ? "—" : Math.round(stats.avg)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average Workout Volume This Week</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
      </Card>
    </TooltipProvider>
  );
}
