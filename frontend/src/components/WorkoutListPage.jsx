import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { getWorkouts } from "../api";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { CalendarIcon, DumbbellIcon, LogOutIcon, PlusIcon } from "lucide-react";

// Subcomponent for displaying a performed exercise
function PerformedExerciseItem({ pe }) {
  return (
    <li className="text-sm">
      <div>
        <b>{pe.exercise?.name}</b> — Sets: {pe.sets},
        Reps: {Array.isArray(pe.reps_per_set) ? pe.reps_per_set.join(", ") : "N/A"},
        Weights: {Array.isArray(pe.weights_per_set) ? pe.weights_per_set.join(", ") : "N/A"}
      </div>
    </li>
  );
}

// Subcomponent for displaying a workout and its exercises
function WorkoutItem({ workout, expanded, setExpanded }) {
  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(expanded === workout.id ? null : workout.id)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{workout.date}</CardTitle>
          </div>
          <Badge variant="secondary">
            {expanded === workout.id ? "▲" : "▼"}
          </Badge>
        </div>
      </CardHeader>
      {expanded === workout.id && workout.performed_exercises && (
        <CardContent>
          <Separator className="my-2" />
          <ul className="space-y-2">
            {workout.performed_exercises.map((pe) => (
              <li key={pe.id} className="flex items-start gap-2">
                <DumbbellIcon className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">{pe.exercise?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Sets: {pe.sets} • 
                    Reps: {Array.isArray(pe.reps_per_set) ? pe.reps_per_set.join(", ") : "N/A"} •
                    Weights: {Array.isArray(pe.weights_per_set) ? pe.weights_per_set.join(", ") : "N/A"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkouts();
        setWorkouts(data || []);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [user]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground">Track your fitness progress</p>
        </div>
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => { setUser(null); navigate("/auth"); }}
        >
          <LogOutIcon className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading workouts...
        </div>
      ) : error ? (
        <Card className="p-4">
          <div className="text-destructive mb-2">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </Card>
      ) : workouts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            No workouts yet. Start logging your first workout!
          </div>
          <Button onClick={() => navigate("/log")}>
            Create Workout
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => (
            <WorkoutItem
              key={w.id}
              workout={w}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          ))}
        </div>
      )}

      <Button
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0"
        onClick={() => navigate("/log")}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}