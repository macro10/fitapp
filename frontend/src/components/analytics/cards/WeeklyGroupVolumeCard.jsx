// frontend/src/components/analytics/cards/WeeklyGroupVolumeCard.jsx
import { useMemo, useState, useId } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { parseISO, format } from "date-fns";

const GROUPS = ["legs", "back", "chest", "shoulders", "arms", "core"];
const LABELS = {
  legs: "Legs",
  back: "Back",
  chest: "Chest",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Core",
};
const THEME = {
  legs: { fill: "#34d399" },       // emerald-400
  back: { fill: "#38bdf8" },       // sky-400
  chest: { fill: "#fb7185" },      // rose-400
  shoulders: { fill: "#f59e0b" },  // amber-500
  arms: { fill: "#a78bfa" },       // violet-400
  core: { fill: "#22d3ee" },       // cyan-400
};

const fmtShort = (n) => {
  if (n == null) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}m`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}`;
};

export default function WeeklyGroupVolumeCard({ weekly }) {
  const [enabled, setEnabled] = useState(() =>
    GROUPS.reduce((acc, g) => ((acc[g] = true), acc), {})
  );
  const gid = useId();

  const data = useMemo(() => {
    if (!Array.isArray(weekly)) return [];
    return weekly.map((w) => {
      const d = parseISO(w.weekStart);
      const label = isNaN(d) ? w.weekStart : format(d, "MMM d");
      const row = { label, total: w.total || 0 };
      for (const g of GROUPS) row[g] = w.groups?.[g] || 0;
      return row;
    });
  }, [weekly]);

  const yMax = useMemo(() => {
    if (!data.length) return 0;
    // compute max of stacked only for enabled groups
    return Math.max(
      ...data.map((row) =>
        GROUPS.reduce((sum, g) => sum + (enabled[g] ? (row[g] || 0) : 0), 0)
      )
    );
  }, [data, enabled]);

  const toggle = (g) => setEnabled((s) => ({ ...s, [g]: !s[g] }));

  if (!data.length) {
    return (
      <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50 pb-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <CardHeader className="pb-0">
          <div className="grid grid-cols-[36px_1fr] gap-x-3">
            <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Weekly Group Volume</CardTitle>
              <p className="text-muted-foreground">No data in range</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50 pb-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <CardHeader className="pb-0">
        <div className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-2">
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Weekly Group Volume</CardTitle>
            <p className="text-muted-foreground">Stacked volume by muscle group</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-3 flex flex-wrap gap-2 pl-[38px]">
          {GROUPS.map((g) => {
            const active = enabled[g];
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggle(g)}
                className={`h-7 px-2.5 rounded-full text-[11px] leading-[22px] ring-1 transition-colors flex items-center gap-2
                ${active ? "bg-muted/15 ring-white/10 text-foreground/80" : "bg-transparent ring-white/10 text-foreground/45"}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: THEME[g].fill }}
                />
                {LABELS[g]}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4 md:pt-6">
        <div className="w-full">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 16, right: 20, left: 2, bottom: 8 }}
              barCategoryGap="20%"
              barGap={0}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="10 10"
                stroke="rgba(148, 163, 184, 0.22)"
              />
              <XAxis
                dataKey="label"
                stroke="#888888"
                tick={{ fill: "currentColor", fontSize: 12, opacity: 0.8 }}
                interval="preserveStartEnd"
                minTickGap={28}
                height={24}
                tickMargin={10}
              />
              <YAxis
                stroke="#888888"
                tick={{ fill: "currentColor", fontSize: 12, opacity: 0.8 }}
                width={40}
                allowDecimals={false}
                tickFormatter={fmtShort}
                domain={[0, Math.max(1, yMax)]}
                tickLine={false}
                axisLine={{ stroke: "rgba(148, 163, 184, 0.45)", strokeWidth: 1.25, strokeLinecap: "round" }}
              />
              <Tooltip
                cursor={{ fill: "transparent", stroke: "rgba(148, 163, 184, 0.35)", strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.95)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  padding: "10px",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                labelStyle={{ color: "#A3A3A3" }}
                formatter={(value, name) => [fmtShort(value), LABELS[name] ?? name]}
              />
              {GROUPS.map((g) =>
                enabled[g] ? (
                  <Bar
                    key={`${g}-${gid}`}
                    dataKey={g}
                    stackId="vol"
                    name={g}
                    fill={THEME[g].fill}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive
                    animationDuration={600}
                  />
                ) : null
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}