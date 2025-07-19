import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { getWorkouts, deleteWorkout } from "../api";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { CalendarIcon, DumbbellIcon, LogOutIcon, PlusIcon, Trash2Icon, ChevronDown } from "lucide-react";
import { useToast } from "../hooks/use-toast"
import { Toaster } from "./ui/toaster"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { WORKOUT_STORAGE_KEY, CURRENT_EXERCISE_STORAGE_KEY } from '../hooks/useWorkoutLogger';

// First, let's add a helper function to calculate volume
const calculateExerciseVolume = (performedExercise) => {
  return performedExercise.reps_per_set.reduce((total, reps, index) => {
    const weight = performedExercise.weights_per_set[index] || 0;
    return total + (reps * weight);
  }, 0);
};

const calculateTotalVolume = (exercises) => {
  return exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
};

// Add this helper function for formatting the volume
const formatVolume = (volume) => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return `${volume}`;
};

// Add this helper function near the other helper functions at the top
const getRelativeTimeString = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// Update the WorkoutItem component
function WorkoutItem({ workout, expanded, setExpanded, onDelete }) {
  const isExpanded = expanded === workout.id;
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <button 
              className="flex items-center gap-2 flex-1 text-left group" 
              onClick={() => setExpanded(isExpanded ? null : workout.id)}
              aria-expanded={isExpanded}
              aria-controls={`workout-details-${workout.id}`}
            >
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg flex-1">{workout.name || 'Untitled Workout'}</CardTitle>
              <div 
                className="text-sm text-muted-foreground" 
                title={workout.date}  // This will show the full date on hover
              >
                {getRelativeTimeString(workout.date)}
              </div>
              <div className="bg-zinc-900 px-2.5 py-0.5 rounded-full text-sm font-bold text-white mr-2">
                {formatVolume(calculateTotalVolume(workout.performed_exercises))}
              </div>
              <ChevronDown 
                className={cn(
                  "h-6 w-6 text-muted-foreground transition-transform duration-200",
                  isExpanded && "transform rotate-180"
                )}
              />
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workout.id);
              }}
              aria-label="Delete workout"
            >
              <Trash2Icon className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        {isExpanded && workout.performed_exercises && (
          <CardContent
            id={`workout-details-${workout.id}`}
            role="region"
            aria-labelledby={`workout-title-${workout.id}`}
          >
            <Separator className="my-2" />
            <ul className="space-y-2">
              {workout.performed_exercises.map((pe, index) => (
                <li key={pe.id}>
                  <div className="py-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="bg-muted/10 p-1.5 rounded-md">
                        <DumbbellIcon className="h-4 w-4 text-foreground/70" />
                      </div>
                      <div className="font-semibold text-base">{pe.exercise?.name}</div>
                    </div>
                    <div className="pl-9 flex flex-wrap gap-3 text-sm">
                      {Array.from({ length: pe.sets }, (_, i) => (
                        <span key={i} className="inline-flex items-center bg-muted/5 px-2.5 py-1 rounded-md">
                          <span className="font-medium">{pe.reps_per_set[i]}</span>
                          <span className="text-muted-foreground mx-1">×</span>
                          <span className="font-medium">{pe.weights_per_set[i]}</span>
                          <span className="text-muted-foreground text-xs ml-0.5">lb</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {index < workout.performed_exercises.length - 1 && (
                    <Separator className="bg-muted/90" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <WorkoutSkeleton key={i} />
      ))}
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <Card className="p-4">
      <div className="text-destructive mb-2">{error}</div>
      <Button onClick={onRetry} variant="outline">
        Try again
      </Button>
    </Card>
  );
}

function EmptyState({ onCreateWorkout }) {
  return (
    <Card className="p-8 text-center">
      <div className="text-muted-foreground mb-4">
        No workouts yet. Start logging your first workout!
      </div>
      <Button onClick={onCreateWorkout}>
        Create Workout
      </Button>
    </Card>
  );
}

function WorkoutSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/3 h-6 bg-muted rounded" />
            <div className="w-8 h-8 bg-muted rounded" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for any in-progress workout data
    const hasInProgressWorkout = localStorage.getItem(WORKOUT_STORAGE_KEY) || 
                                localStorage.getItem(CURRENT_EXERCISE_STORAGE_KEY);
    
    if (hasInProgressWorkout) {
      // If there's an in-progress workout or exercise, redirect to the logger
      navigate("/log");
      return;
    }

    // Otherwise proceed with fetching workouts
    fetchWorkouts();
  }, [user, navigate]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkouts();
      // Sort workouts by date in descending order (newest first)
      const sortedWorkouts = [...data].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setWorkouts(sortedWorkouts || []);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    const originalWorkouts = workouts;
    
    try {
      // Optimistically update UI
      setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
      
      // Show success toast immediately
      toast({
        title: "Workout deleted",
        description: "Your workout has been successfully deleted.",
        variant: "success", // Using our new success variant
        duration: 2000,
      });
      
      // Make API call
      await deleteWorkout(workoutId);
    } catch (err) {
      // Restore original state on error
      setWorkouts(originalWorkouts);
      
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      
      console.error('Error deleting workout:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/auth");
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
    if (workouts.length === 0) return <EmptyState onCreateWorkout={() => navigate("/log")} />;

    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {workouts.map((workout) => (
            <WorkoutItem
              key={workout.id}
              workout={workout}
              expanded={expanded}
              setExpanded={setExpanded}
              onDelete={handleDeleteWorkout}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Workouts</h1>
            <p className="text-muted-foreground">Track your fitness progress</p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>

        {renderContent()}

        <Button
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0"
          onClick={() => navigate("/log")}
          aria-label="Create new workout"
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>
      <Toaster />
    </>
  );
}