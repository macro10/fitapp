import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";
import { CalendarIcon, DumbbellIcon, TrophyIcon } from "lucide-react";

export default function TopWorkoutsCard() {
  const [topWorkouts, setTopWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopWorkouts = async () => {
      try {
        const data = await getTopWorkouts();
        setTopWorkouts(data.top_workouts);
      } catch (err) {
        setError("Failed to load top workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchTopWorkouts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 p-2 rounded-md">
            <TrophyIcon className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <CardTitle>Top Workouts</CardTitle>
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
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topWorkouts.map((workout, index) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-medium text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{workout.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(workout.date), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <DumbbellIcon className="h-4 w-4" />
                      <span>{workout.exercise_count} exercises</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 px-3 py-1 rounded-full text-sm font-medium text-white">
                  {workout.total_volume.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}