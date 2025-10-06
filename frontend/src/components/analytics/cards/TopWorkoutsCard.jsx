import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";
import { TrophyIcon, Activity } from "lucide-react";

const formatVolume = (volume) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return `${volume}`;
};

const formatTimeOfDay = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function TopWorkoutsCard() {
  const [topWorkouts, setTopWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTopWorkouts = async () => {
      try {
        const data = await getTopWorkouts(5, { signal: controller.signal });
        setTopWorkouts(data.top_workouts);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError("Failed to load top workouts");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopWorkouts();
    return () => controller.abort();
  }, []);

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
        ) : (
          <div>
            {topWorkouts.map((workout, index) => (
              <div key={workout.id}>
                <div className="py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl font-bold text-foreground/60">
                        #{index + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold">
                          {workout.name}
                        </h4>
                        <p className="text-sm text-foreground/70">
                          {format(new Date(workout.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted/10 px-2.5 py-1 text-xs text-foreground/80">
                      {formatTimeOfDay(workout.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    <div className="text-2xl font-semibold text-accent">
                      {formatVolume(workout.total_volume)}
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">volume</span>
                  </div>
                </div>
                
                {index < topWorkouts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}