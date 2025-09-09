import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { getTopWorkouts } from "../../../api";
import { format } from "date-fns";
import { DumbbellIcon, TrophyIcon } from "lucide-react";

const formatVolume = (volume) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return `${volume}`;
};

const getRankingColor = (index) => {
  switch (index) {
    case 0: return "text-yellow-500"; // Gold
    case 1: return "text-gray-400";   // Silver
    case 2: return "text-amber-800";  // Darker bronze (changed from amber-700)
    default: return "text-zinc-900";  // Same as volume pills
  }
};

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
              <Card key={i} className="animate-pulse mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-6 bg-muted rounded" />
                    <div className="w-8 h-8 bg-muted rounded" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topWorkouts.map((workout, index) => (
              <Card key={workout.id} className="mb-4 hover:shadow-lg transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getRankingColor(index)}`}>
                        #{index + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold">{workout.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(workout.date), "MMM d, yyyy")} • {workout.exercise_count} exercises
                        </p>
                      </div>
                    </div>
                    <div className="bg-zinc-900 px-3 py-1 rounded-full text-sm font-medium text-white">
                      {formatVolume(workout.total_volume)}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}