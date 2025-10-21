import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import WeeklyFrequencyChart from "../charts/WeeklyFrequencyChart";
import { BarChart } from "lucide-react";
import { useState } from 'react';

export default function WorkoutFrequencyCard() {
  const [stats, setStats] = useState({ avg: 0, max: 0, weeks: 0 });

  const chip =
    "h-7 px-2.5 rounded-full text-[11px] leading-[22px] ring-1 tabular-nums flex items-center gap-1 whitespace-nowrap ring-zinc-900/10 dark:ring-white/10 bg-zinc-950/[.03] dark:bg-muted/15 text-zinc-700 dark:text-foreground/80";

  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50 pb-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <CardHeader className="pb-0">
        <div className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-2">
          {/* Icon */}
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-foreground/70" />
          </div>

          {/* Title + subtitle */}
          <div className="space-y-1">
            <CardTitle className="text-2xl">Weekly Sessions</CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Workouts per week</p>
              <span className="h-5 px-2 rounded-full text-[10px] leading-[18px] bg-muted/15 ring-1 ring-white/10 text-foreground/70">
                Last 6 months
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 md:pt-6">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 pl-[38px] pr-[20px]">
          <div className={chip}>
            <span className="opacity-70">Average</span>
            <span>{stats.avg ? stats.avg.toFixed(1) : "—"}</span>
          </div>
          <div className={`${chip}`}>
            <span className="opacity-70">Best week</span>
            <span>{stats.max || "—"}</span>
          </div>
          <div className={chip}>
            <span className="opacity-70">Weeks</span>
            <span>{stats.weeks || "—"}</span>
          </div>
        </div>

        <WeeklyFrequencyChart onStats={setStats} />
      </CardContent>
    </Card>
  );
}