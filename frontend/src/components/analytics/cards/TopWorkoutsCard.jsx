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
          <div className="w-10 h-5 bg-muted/30 rounded" />
          <div className="space-y-2 w-full">
            <div className="h-4 w-40 bg-muted/30 rounded" />
            <div className="h-3 w-56 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="h-5 w-12 bg-muted/20 rounded-full" />
      </div>
      <div className="h-6 w-24 bg-muted/30 rounded ml-[3.25rem]" />
    </div>
  );
}

export default function TopWorkoutsCard() {
  const [data, setData] = useState(null); // null => not resolved yet
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Load a bigger batch once; reveal progressively on scroll
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
          // Only resolve to [] on real errors; keep null on abort so skeleton remains
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopWorkouts();
    return () => controller.abort();
  }, []);

  const hasMore = visibleCount < data?.length || false; // Use data.length
  const visible = useMemo(() => data?.slice(0, visibleCount), [data, visibleCount]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom && hasMore) {
      setVisibleCount((c) => Math.min(c + 10, data?.length || 0)); // Use data.length
    }
  };

  return (
    <Card className="rounded-2xl border bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 p-2 rounded-md">
            <TrophyIcon className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Top Workouts</CardTitle>
            <p className="text-muted-foreground">Your strongest performances</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data === null ? (
          <div role="status" aria-label="Loading top workouts">
            {[1,2,3,4,5].map((i) => (
              <div key={i}>
                <AnalyticsItemSkeleton />
                {i < 5 && <Separator className="ml-[3.25rem]" />}
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
            className="max-h-[60vh] overflow-y-auto pr-1 -mr-1"
            onScroll={onScroll}
            role="list"
            aria-label="Top workouts"
          >
            {visible.map((workout, index) => (
              <div key={workout.id} role="listitem">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    window.location.href = `/#go=workout&wid=${workout.id}`; // minimal, robust across screens
                  }}
                >
                  <div className="py-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 text-right text-lg font-semibold text-foreground/70 shrink-0">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-semibold truncate">{workout.name}</h4>
                          <p className="text-sm text-foreground/70 truncate">
                            {format(new Date(workout.date), "MMM d, yyyy")} • {workout.exercise_count} exercises
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted/10 px-2 py-0.5 text-[11px] text-foreground/80">
                        {formatTimeOfDay(workout.date)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 pl-[3.25rem] mt-1">
                      <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
                        {formatVolume(workout.total_volume)}
                      </span>
                      <span className="text-[10px] leading-none text-muted-foreground tracking-wider uppercase translate-y-[1px]">
                        vol
                      </span>
                    </div>
                  </div>
                </button>
                {index < visible.length - 1 && <Separator className="ml-[3.25rem]" />}
              </div>
            ))}

            {/* Load-more indicator */}
            {hasMore && (
              <div className="py-3 text-center text-sm text-muted-foreground">Scroll to load more…</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}