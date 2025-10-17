// frontend/src/components/analytics/cards/CurrentWeekCard.jsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import { Dumbbell, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { subMonths, startOfISOWeek, endOfISOWeek } from "date-fns";
import { getWeeklyVolumeAnalytics } from "../../../api";

export default function CurrentWeekCard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    latest: 0,     // current week-to-date total
    workouts: 0,   // workouts so far this week
    avg: 0,        // avg vol/workout this week
    prevAvg: 0,    // last week's avg vol/workout
    prevTotal: 0,  // last week's total volume
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
          if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0, prevAvg: 0, prevTotal: 0 });
          return;
        }

        const current = arr[arr.length - 1] || {};
        const latest = Number(current.totalVolume || 0);
        const avg = Number(current.avgVolumePerWorkout || 0);
        const workouts = current.workoutCount ?? (avg ? Math.round(latest / avg) : 0);

        const prev = arr[arr.length - 2] || {};
        const prevAvg = Number(prev.avgVolumePerWorkout || 0);
        const prevTotal = Number(prev.totalVolume || 0);

        if (!cancelled) {
          setStats({ latest, workouts, avg, prevAvg, prevTotal });
        }
      } catch {
        if (!cancelled) setStats({ latest: 0, workouts: 0, avg: 0, prevAvg: 0, prevTotal: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Styles
  const chipBase =
    "flex items-center justify-between gap-2 h-8 px-3 rounded-full text-xs font-medium ring-1 tabular-nums";

  // Average vs last week
  const avgDeltaPct = stats.prevAvg
    ? Math.round(((stats.avg - stats.prevAvg) / stats.prevAvg) * 100)
    : 0;

  const avgPillClass = (() => {
    const prev = stats.prevAvg;
    if (!prev) return "bg-muted/20 text-foreground/70 ring-white/5";
    const pct = ((stats.avg - prev) / prev) * 100;
    if (pct > 0) return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25";
    if (pct <= -20) return "bg-red-500/15 text-red-300 ring-1 ring-red-400/25"; // worse by 20%+
    return "bg-yellow-500/10 text-yellow-300 ring-yellow-400/20"; // within 0–20% lower (neutral)
  })();

  const AvgIcon = (() => {
    const prev = stats.prevAvg;
    if (!prev) return TrendingUp;
    const pct = ((stats.avg - prev) / prev) * 100;
    return pct > 0 ? TrendingUp : TrendingDown;
  })();

  // Progress vs last completed week
  const progressPct = stats.prevTotal ? Math.min(999, Math.round((stats.latest / stats.prevTotal) * 100)) : 0;

  // Elapsed week (for “on‑track” marker)
  const weekStart = startOfISOWeek(new Date());
  const weekEnd = endOfISOWeek(new Date());
  const weekPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(((Date.now() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100)
    )
  );
  const markerLeftPct = Math.max(0, Math.min(100, weekPct));
  const paceDelta = progressPct - weekPct;
  const paceLabel = paceDelta >= 5 ? "ahead" : paceDelta <= -5 ? "behind" : "on track";
  const paceClass =
    paceDelta >= 5
      ? "text-emerald-300"
      : paceDelta <= -5
      ? "text-red-300"
      : "text-yellow-300";

  const deltaChipClass =
  avgDeltaPct > 0
    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25"
    : avgDeltaPct <= -20
    ? "bg-red-500/15 text-red-300 ring-red-400/25"
    : "bg-yellow-500/10 text-yellow-300 ring-yellow-400/20"; // neutral for small negatives (0..-20%)

  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <CardHeader className="pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle className="text-2xl">This Week</CardTitle>
              <p className="text-muted-foreground">Volume metrics</p>
            </div>
          </div>

          <div className="text-4xl md:text-5xl font-semibold leading-tight tabular-nums tracking-tight">
            {loading ? "—" : stats.latest.toLocaleString()}
          </div>
        </div>

        {/* Progress vs last week */}
        <div className="mt-5 space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress vs last week</span>
            <div className="flex items-center gap-3">
              <span className={`tabular-nums ${paceClass}`}>
                {stats.prevTotal ? `${paceLabel} (${Math.abs(paceDelta)}%)` : "—"}
              </span>
              <span className="tabular-nums">{stats.prevTotal ? `${Math.min(progressPct, 999)}%` : "—"}</span>
            </div>
          </div>

          <div className="relative h-2.5 w-full rounded-full bg-muted/20 ring-1 ring-white/5 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/70 via-emerald-400/70 to-emerald-300/70"
              style={{ width: `${Math.max(0, Math.min(progressPct, 100))}%` }}
            />
            {/* On-track marker */}
            <div
              className="absolute inset-y-0 w-0.5 bg-white/35"
              style={{ left: `calc(${markerLeftPct}% - 1px)` }}
              aria-hidden
            />
          </div>
        </div>

        {/* Key metrics (explicitly labeled chips) */}
        <div className="mt-6 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Workouts */}
          <div className={`${chipBase} bg-muted/20 text-foreground/90 ring-white/10`}>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 opacity-80" />
              <span className="opacity-90">Workouts</span>
            </div>
            <span>{loading ? "—" : stats.workouts}</span>
          </div>

          {/* Avg per workout */}
          <div className={`${chipBase} ${avgPillClass}`}>
            <div className="flex items-center gap-1.5">
              <AvgIcon className="h-3.5 w-3.5 opacity-80" />
              <span className="opacity-90">Average Workout</span>
            </div>
            <span>{loading ? "—" : Math.round(stats.avg).toLocaleString()}</span>
          </div>

          {/* Average delta */}
          <div className={`${chipBase} ${deltaChipClass}`}>
            <div className="flex items-center gap-1.5">
              <span className="opacity-90">Average Workout Δ</span>
            </div>
            <span>
              {loading ? "—" : `${avgDeltaPct > 0 ? "+" : avgDeltaPct < 0 ? "−" : ""}${Math.abs(avgDeltaPct)}%`}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}