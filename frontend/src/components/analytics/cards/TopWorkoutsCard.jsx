import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";
import { TrophyIcon, Activity } from "lucide-react";

const formatVolume = (volume) => (volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : `${volume}`);
const formatTimeOfDay = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function TopWorkoutsCard() {
  const [allTopWorkouts, setAllTopWorkouts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Load a bigger batch once; reveal progressively on scroll
  useEffect(() => {
    const controller = new AbortController();
    const fetchTopWorkouts = async () => {
      try {
        // Request a generous chunk up-front; we paginate client-side
        const data = await getTopWorkouts(100, { signal: controller.signal });
        setAllTopWorkouts(data.top_workouts || []);
      } catch (err) {
        if (err.code !== "ERR_CANCELED" && err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load top workouts");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopWorkouts();
    return () => controller.abort();
  }, []);

  const hasMore = visibleCount < allTopWorkouts.length;
  const visible = useMemo(() => allTopWorkouts.slice(0, visibleCount), [allTopWorkouts, visibleCount]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom && hasMore) {
      setVisibleCount((c) => Math.min(c + 10, allTopWorkouts.length));
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
        {error ? (
          <div className="text-destructive text-center py-4">{error}</div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse py-4">
                <div className="flex justify-between items-center">
                  <div className="w-1/3 h-6 bg-muted rounded" />
                  <div className="w-16 h-6 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : allTopWorkouts.length === 0 ? (
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
                <div className="py-4">
                  {/* Header row: rank + name/date on left, time pill on right */}
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
                    <span className="shrink-0 rounded-full bg-muted/10 px-2.5 py-1 text-xs text-foreground/80">
                      {formatTimeOfDay(workout.date)}
                    </span>
                  </div>

                  {/* Volume row */}
                  <div className="flex items-baseline gap-1 pl-[3.25rem] mt-1">
                    <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
                      {formatVolume(workout.total_volume)}
                    </span>
                    <span className="text-[10px] leading-none text-muted-foreground tracking-wider uppercase translate-y-[1px]">
                      vol
                    </span>
                  </div>
                </div>

                {index < visible.length - 1 && <Separator />}
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