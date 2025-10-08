import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyVolumeChart from "../charts/WeeklyVolumeChart";
import { LineChart } from "lucide-react";
import { subMonths } from "date-fns";
import { getWeeklyVolumeAnalytics } from "../../../api";

export default function VolumeProgressCard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    latest: 0,
    deltaPct: 0,
    avg: 0,
    workouts: undefined,
    max: 0,
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
          setStats({ latest: 0, deltaPct: 0, avg: 0, workouts: undefined, max: 0 });
          return;
        }

        const latestItem = arr[arr.length - 1] || {};
        const prevItem = arr[arr.length - 2] || {};

        const latest = Number(latestItem.totalVolume || 0);
        const prev = Number(prevItem.totalVolume || 0);
        const avg = Number(latestItem.avgVolumePerWorkout || 0);
        const workouts = latestItem.workoutCount ?? (avg ? Math.round(latest / avg) : undefined);
        const deltaPct = prev ? ((latest - prev) / prev) * 100 : 0;
        const max = Math.max(...arr.map((x) => Number(x.totalVolume || 0)));

        if (!cancelled) {
          setStats({ latest, deltaPct, avg, workouts, max });
        }
      } catch {
        if (!cancelled) {
          setStats({ latest: 0, deltaPct: 0, avg: 0, workouts: undefined, max: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toK = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);

  const deltaUp = stats.deltaPct >= 0;
  const deltaClass = deltaUp
    ? "bg-emerald-500/10 text-emerald-400"
    : "bg-red-500/10 text-red-400";

  return (
    <Card className="pb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 p-2 rounded-md">
            <LineChart className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Strength</CardTitle>
            <p className="text-muted-foreground">Your workout volume by week</p>
          </div>
        </div>

        {/* Headline + pills */}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="text-3xl font-semibold leading-none tabular-nums">
            {loading ? "—" : stats.latest.toLocaleString()}
          </div>

          <div className={`text-xs px-2 py-1 rounded-full ${deltaClass}`}>
            {loading ? "—" : `${deltaUp ? "+" : ""}${stats.deltaPct.toFixed(1)}%`}
          </div>

          <div className="text-xs px-2 py-1 rounded-full bg-muted/20 text-foreground/80">
            {loading ? "Avg —" : `Avg ${toK(Math.round(stats.avg))}`}
          </div>

          {stats.workouts !== undefined && (
            <div className="text-xs px-2 py-1 rounded-full bg-muted/20 text-foreground/80">
              {loading ? "Workouts —" : `Workouts ${stats.workouts}`}
            </div>
          )}

          <div className="text-xs px-2 py-1 rounded-full bg-muted/20 text-foreground/80">
            {loading ? "High —" : `High ${toK(stats.max)}`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <WeeklyVolumeChart />
      </CardContent>
    </Card>
  );
}
