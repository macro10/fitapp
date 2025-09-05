import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";

export default function TopWorkoutsCard() {
  console.log('TopWorkoutsCard rendered'); // Add this line

  const [topWorkouts, setTopWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('TopWorkoutsCard useEffect triggered'); // Add this line
    const fetchTopWorkouts = async () => {
      try {
        console.log("Fetching top workouts...");
        const data = await getTopWorkouts();
        console.log("Received top workouts:", data);
        setTopWorkouts(data.top_workouts);
      } catch (err) {
        console.error("Error fetching top workouts:", err);
        setError("Failed to load top workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchTopWorkouts();
  }, []);

  // Add a very obvious visual indicator
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Workouts {loading ? '(Loading...)' : ''}</CardTitle>
        <p className="text-muted-foreground">Your strongest performances</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 font-bold">
            Error: {error}
          </div>
        )}
        <div className="space-y-4">
          {!loading && !error && topWorkouts && topWorkouts.length > 0 ? (
            topWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <h4 className="font-medium">{workout.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(workout.date), "MMM d, yyyy")} • {workout.exercise_count} exercises
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{workout.total_volume.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              {loading ? 'Loading workouts...' : 'No workouts found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
