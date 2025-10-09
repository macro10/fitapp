import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";
import { TrophyIcon } from "lucide-react";

const formatVolume = (volume) => (volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : `${volume}`);
const formatTimeOfDay = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function AnalyticsItemSkeleton() {
  return (
    <div className="py-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-6 bg-muted/30 rounded-md" />
          <div className="space-y-2 w-full">
            <div className="h-4 w-40 bg-muted/30 rounded" />
            <div className="h-3 w-56 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-muted/20 rounded-full" />
      </div>
      <div className="h-6 w-24 bg-muted/30 rounded ml-[3.75rem]" />
    </div>
  );
}

function StatPill({ icon: Icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/10 px-2.5 py-1 text-xs text-foreground/80">
      {Icon ? <Icon className="h-3.5 w-3.5 text-accent" /> : null}
      <span className="font-semibold tabular-nums">{value}</span>
      {label ? <span className="text-foreground/60">{label}</span> : null}
    </span>
  );
}

export default function TopWorkoutsCard() {
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTopWorkouts = async () => {
      try {
        const res = await getTopWorkouts(100, { signal: controller.signal });
        const list = res?.top_workouts ?? res?.results ?? res?.items ?? res ?? [];
        setData(Array.isArray(list) ? list : []);
      } catch (e) {
        const isAbort =
          e?.name === "AbortError" ||
          e?.name === "CanceledError" ||
          e?.code === "ERR_CANCELED" ||
          String(e?.message || "").toLowerCase().includes("abort");
        if (!isAbort) {
          setError("Failed to load top workouts");
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopWorkouts();
    return () => controller.abort();
  }, []);

  const hasMore = visibleCount < (data?.length || 0);
  const visible = useMemo(() => data?.slice(0, visibleCount), [data, visibleCount]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom && hasMore) {
      setVisibleCount((c) => Math.min(c + 10, data?.length || 0));
    }
  };

  return (
    <Card className="relative rounded-2xl border bg-card/60 ring-1 ring-border/50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 p-2 rounded-md">
            <TrophyIcon className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">Top Workouts</CardTitle>
            <p className="text-muted-foreground">Your strongest performances</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data === null ? (
          <div role="status" aria-label="Loading top workouts">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <AnalyticsItemSkeleton />
                {i < 5 && <Separator className="ml-[3.75rem]" />}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-4">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No top workouts yet.</div>
        ) : (
          <div
            ref={scrollRef}
            className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden overscroll-x-none touch-pan-y pr-1 -mr-1"
            onScroll={onScroll}
            role="list"
            aria-label="Top workouts"
          >
            {visible.map((workout, index) => (
              <div key={workout.id} role="listitem">
                <button
                  type="button"
                  className="group relative w-full text-left rounded-xl transition-all duration-200 hover:bg-muted/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                  onClick={() => {
                    window.location.href = `/#go=workout&wid=${workout.id}`;
                  }}
                  aria-label={`Open workout “${workout.name}”, rank #${index + 1}`}
                >
                  {/* subtle left rail accent on hover/focus */}
                  <div
                    className="pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden
                  />
                  <div className="py-5 px-2 sm:px-3 group-hover:translate-x-[1px]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* rank chip */}
                        <div className="w-12 shrink-0">
                          <span className="inline-flex w-full items-center justify-center rounded-md border border-border/60 bg-muted/10 px-2 py-0.5 text-[13px] font-semibold text-foreground/80 tabular-nums">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold tracking-tight truncate">
                            {workout.name || "Untitled Workout"}
                          </h4>
                          <p className="text-sm text-foreground/70 truncate">
                            {format(new Date(workout.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      {/* time pill (matches WorkoutItem) */}
                      <span className="shrink-0 rounded-full bg-muted/20 backdrop-blur px-2.5 py-1 text-xs text-foreground/80 border border-border/50">
                        {formatTimeOfDay(workout.date)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 pl-[3.75rem]">
                      <StatPill value={formatVolume(workout.total_volume)} label="vol" />
                      <StatPill
                        value={
                          workout?.exercise_count ??
                          (Array.isArray(workout?.performed_exercises) ? workout.performed_exercises.length : "—")
                        }
                        label="ex"
                      />
                    </div>
                  </div>
                </button>
                {index < visible.length - 1 && <Separator className="ml-[3.75rem]" />}
              </div>
            ))}

            {hasMore && (
              <div className="py-3 text-center text-sm text-muted-foreground">Scroll to load more…</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}