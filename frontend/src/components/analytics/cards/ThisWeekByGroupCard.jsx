// frontend/src/components/analytics/cards/ThisWeekByGroupCard.jsx
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { PieChart } from "lucide-react";

const GROUP_LABELS = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
};

// Tailwind color theme per group (fill + text)
const GROUP_THEME = {
  legs: { fill: "from-emerald-500/70 via-emerald-400/70 to-emerald-300/70", text: "text-emerald-300", ring: "ring-emerald-400/25" },
  back: { fill: "from-sky-500/70 via-sky-400/70 to-sky-300/70", text: "text-sky-300", ring: "ring-sky-400/25" },
  chest: { fill: "from-rose-500/70 via-rose-400/70 to-rose-300/70", text: "text-rose-300", ring: "ring-rose-400/25" },
  shoulders: { fill: "from-amber-500/70 via-amber-400/70 to-amber-300/70", text: "text-amber-300", ring: "ring-amber-400/25" },
  arms: { fill: "from-violet-500/70 via-violet-400/70 to-violet-300/70", text: "text-violet-300", ring: "ring-violet-400/25" },
  core: { fill: "from-cyan-500/70 via-cyan-400/70 to-cyan-300/70", text: "text-cyan-300", ring: "ring-cyan-400/25" },
};

const ORDER = ["legs", "back", "chest", "shoulders", "arms", "core"];

function formatNum(n) {
  if (n == null) return "—";
  return n >= 100000
    ? new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n)
    : n.toLocaleString();
}

export default function ThisWeekByGroupCard({ data }) {
  const current = data?.this || {};
  const deltaPct = data?.deltaPct || {};
  const totalThis = data?.totalThis || 0;
  const topGroup = data?.topGroup;

  const rows = ORDER.map((g) => {
    const vol = Number(current[g] || 0);
    const share = totalThis ? vol / totalThis : 0;
    const pct = Math.round(share * 100);
    const delta = deltaPct[g];
    return { key: g, label: GROUP_LABELS[g], vol, pct, delta };
  }).sort((a, b) => b.vol - a.vol);

  const topRow = rows.find((r) => r.key === topGroup);
  const topShare = topRow ? topRow.pct : 0;

  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50 pb-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <CardHeader className="pb-0">
        <div className="grid grid-cols-[36px_1fr_auto] items-start gap-x-3 gap-y-2">
          <div className="bg-muted/10 p-2 rounded-md h-9 w-9 flex items-center justify-center">
            <PieChart className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">This Week by Group</CardTitle>
            <p className="text-muted-foreground">Share of total volume</p>
          </div>

          {/* Top group highlight */}
          <div className="flex items-center gap-2">
            <span className="h-6 px-2.5 rounded-full text-[11px] leading-[22px] bg-muted/15 ring-1 ring-white/10 text-foreground/70">
              {topGroup ? `Top: ${GROUP_LABELS[topGroup]} • ${topShare}%` : "Top: —"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 md:pt-6">
        <div className="space-y-3">
          {rows.map((row) => {
            const theme = GROUP_THEME[row.key];
            const isTop = row.key === topGroup;
            const width = Math.max(0, Math.min(row.pct, 100));

            // delta chip color
            const d = row.delta;
            const deltaClass =
              d == null
                ? "bg-muted/20 text-foreground/70 ring-white/5"
                : d > 0
                ? `bg-emerald-500/15 text-emerald-300 ${theme?.ring || "ring-emerald-400/25"}`
                : d < 0
                ? "bg-red-500/15 text-red-300 ring-red-400/25"
                : "bg-yellow-500/10 text-yellow-300 ring-yellow-400/20";

            return (
              <div
                key={row.key}
                className={`rounded-lg p-3 transition-colors ${isTop ? "bg-muted/10 ring-1 ring-white/10" : "bg-transparent"}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${theme?.text || ""}`} style={{ background: "currentColor" }} />
                    <span className="text-sm">{row.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-foreground/80">{row.pct ? `${row.pct}%` : "—"}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">({formatNum(row.vol)})</span>
                    <span className={`h-6 px-2.5 rounded-full text-[11px] leading-[22px] ring-1 ${deltaClass}`}>
                      {d == null ? "—" : `${d > 0 ? "+" : ""}${Math.round(d)}%`}
                    </span>
                  </div>
                </div>

                {/* bar */}
                <div className="relative h-2 w-full rounded-full bg-muted/20 ring-1 ring-white/5 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme?.fill || "from-emerald-500/70 to-emerald-300/70"} transition-all duration-700 ease-out`}
                    style={{ width: `${width}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 pointer-events-none transition-all duration-700 ease-out"
                    style={{ width: `${width}%` }}
                  >
                    <div className="h-full bg-[linear-gradient(90deg,rgba(255,255,255,.10)_10%,transparent_10%)] bg-[length:8px_8px] mix-blend-overlay" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total footer (optional) */}
        <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground">
          <span className="tabular-nums">Total: {formatNum(totalThis)}</span>
        </div>
      </CardContent>
    </Card>
  );
}