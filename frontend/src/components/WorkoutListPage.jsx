import { useEffect, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWorkouts } from "../contexts/WorkoutContext";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Switch } from "./ui/switch";
import { CalendarIcon, DumbbellIcon, LogOutIcon, PlusIcon, Trash2Icon, ChevronDown, X, Settings } from "lucide-react";
import { useToast } from "../hooks/use-toast"
import { Toaster } from "./ui/toaster"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { WORKOUT_STORAGE_KEY, CURRENT_EXERCISE_STORAGE_KEY } from '../hooks/useWorkoutLogger';
import { SwipeableRow } from "./ui/swipeable-row";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// First, let's add a helper function to calculate volume 
const calculateExerciseVolume = (performedExercise) => {
  return performedExercise.reps_per_set.reduce((total, reps, index) => {
    const weight = performedExercise.weights_per_set[index] || 0;
    return total + (reps * weight);
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
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Just now: less than 30 seconds
  if (diffSeconds < 30) return 'just now';
  // Seconds: 30-59 seconds
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  // Minutes: 1-59 minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  // Hours: 1-23 hours
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  // Days: 1-6 days
  if (diffDays < 7) {
    return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
  }
  // Weeks: 1-4 weeks
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  // Months: 1-11 months
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  // Years: 1+ years
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// Group identical (reps, weight) pairs into counts
const groupSets = (reps, weights, sets) => {
  const map = new Map();
  for (let i = 0; i < sets; i++) {
    const r = reps[i];
    const w = weights[i] ?? 0;
    const key = `${r}-${w}`;
    if (!map.has(key)) map.set(key, { reps: r, weight: w, count: 0 });
    map.get(key).count++;
  }
  return Array.from(map.values());
};

// Replace the existing DeleteWorkoutDialog with this version
function DeleteWorkoutDialog({ open, onOpenChange, onConfirm, workoutName }) {
  const displayName = (workoutName || "Untitled Workout").trim();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Trash2Icon className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Delete “{displayName}”?</AlertDialogTitle>
          <AlertDialogDescription className="max-w-[32ch] mx-auto">
            This action can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel autoFocus className="flex-1 h-12 rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Modify the WorkoutItem component to use the dialog and memoize it
const WorkoutItem = memo(function WorkoutItem({ workout, expanded, setExpanded, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isExpanded = expanded === workout.id;
  const [expandedExercises, setExpandedExercises] = useState({});
  
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
        <SwipeableRow
          onDelete={() => {
            // open your existing confirm dialog
            setDeleteDialogOpen(true);
          }}
        >
          <CardHeader className="py-4">
            <div className="flex justify-between items-center">
              <button 
                className="flex items-center gap-3 flex-1 text-left group" 
                onClick={() => setExpanded(isExpanded ? null : workout.id)}
                aria-expanded={isExpanded}
                aria-controls={`workout-details-${workout.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-muted/10 p-2 rounded-md">
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isExpanded && "transform rotate-180"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{workout.name || 'Untitled Workout'}</CardTitle>
                    <p className="text-sm text-foreground/70">{getRelativeTimeString(workout.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-accent px-3 py-1 rounded-full text-sm font-medium text-accent-foreground">
                    {formatVolume(workout.total_volume)}
                  </div>
                </div>
              </button>
              <Button
                variant="ghostDestructive"
                size="icon"
                className="h-9 w-9 ml-2 hidden sm:inline-flex"
                onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                aria-label="Delete workout"
              >
                <Trash2Icon className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          {isExpanded && (
            <CardContent
              id={`workout-details-${workout.id}`}
              role="region"
              aria-labelledby={`workout-title-${workout.id}`}
            >
              <Separator className="my-2" />
              {workout.performed_exercises === undefined ? (
                <WorkoutDetailsSkeleton />
              ) : workout.performed_exercises.length === 0 ? (
                <div className="text-sm text-muted-foreground py-3">
                  No exercises logged.
                </div>
              ) : (
                <ul className="space-y-2">
                  {workout.performed_exercises.map((pe, index) => (
                    <li key={pe.id}>
                      <div className="p-4 rounded-lg border bg-card/70 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="bg-muted/20 p-1.5 rounded-md">
                            <DumbbellIcon className="h-4 w-4 text-foreground/70" />
                          </div>
                          <div className="font-semibold text-base">{pe.exercise?.name}</div>
                        </div>
                        <div className="pl-9">
                          <button
                            type="button"
                            className="flex flex-wrap gap-3 text-sm cursor-pointer"
                            onClick={() =>
                              setExpandedExercises((prev) => ({ ...prev, [pe.id]: !prev[pe.id] }))
                            }
                            aria-expanded={!!expandedExercises[pe.id]}
                            title={expandedExercises[pe.id] ? 'Collapse sets' : 'Expand sets'}
                          >
                            {expandedExercises[pe.id]
                              ? Array.from({ length: pe.sets }, (_, i) => (
                                  <span key={i} className="inline-flex items-center bg-muted/10 px-2.5 py-1 rounded-md">
                                    <span className="font-medium">{pe.reps_per_set[i]}</span>
                                    <span className="text-foreground/80 mx-1">×</span>
                                    <span className="font-medium">{pe.weights_per_set[i]}</span>
                                    <span className="text-foreground/90 text-xs ml-0.5">lb</span>
                                  </span>
                                ))
                              : groupSets(pe.reps_per_set, pe.weights_per_set, pe.sets).map((s, i) => (
                                  <span key={`${s.reps}-${s.weight}-${i}`} className="inline-flex items-center bg-muted/10 px-2.5 py-1 rounded-md">
                                    <span className="font-medium">{s.reps}</span>
                                    <span className="text-foreground/80 mx-1">×</span>
                                    <span className="font-medium">{s.weight}</span>
                                    <span className="text-foreground/90 text-xs ml-0.5">lb</span>
                                    {s.count > 1 && (
                                      <span className="text-foreground/80 text-xs ml-2">×{s.count}</span>
                                    )}
                                  </span>
                                ))}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </SwipeableRow>
      </Card>
      <DeleteWorkoutDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => onDelete(workout.id)}
        workoutName={workout.name}
      />
    </motion.div>
  );
});

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

function WorkoutDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i}>
            <div className="py-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="bg-muted/10 p-1.5 rounded-md">
                  <div className="h-4 w-4 bg-muted rounded" />
                </div>
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="pl-9 flex flex-wrap gap-3">
                {[1, 2, 3].map((j) => (
                  <span key={j} className="inline-flex items-center bg-muted/5 px-2.5 py-1 rounded-md">
                    <span className="h-3 w-6 bg-muted rounded" />
                    <span className="text-muted-foreground mx-1">×</span>
                    <span className="h-3 w-6 bg-muted rounded" />
                    <span className="text-muted-foreground text-xs ml-0.5">lb</span>
                  </span>
                ))}
              </div>
            </div>
            {i < 3 && <Separator className="bg-muted/90" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkoutListPage() {
  const [expanded, setExpanded] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
    } catch {
      return document.documentElement.classList.contains('dark');
    }
  });


  const {
    workouts,
    loading,
    error,
    loadWorkouts,
    deleteWorkout: deleteWorkoutFromContext,
    loadWorkoutDetail, // NEW
  } = useWorkouts();

  useEffect(() => {
    // Check for any in-progress workout data
    const hasInProgressWorkout = localStorage.getItem(WORKOUT_STORAGE_KEY) || 
                                localStorage.getItem(CURRENT_EXERCISE_STORAGE_KEY);
    
    if (hasInProgressWorkout) {
      // If there's an in-progress workout or exercise, redirect to the logger
      navigate("/log");
      return;
    }

    // Otherwise proceed with fetching workouts (from cache, then revalidate)
    loadWorkouts().catch(() => {});
  }, [user, navigate, loadWorkouts]);

  // Fetch details when a workout is expanded (deduped and cached in context)
  useEffect(() => {
    if (expanded) {
      loadWorkoutDetail(expanded).catch(() => {});
    }
  }, [expanded, loadWorkoutDetail]);

  const handleDeleteWorkout = useCallback(async (workoutId) => {
    try {
      await deleteWorkoutFromContext(workoutId);
      toast({
        title: "Workout deleted",
        description: "Your workout has been successfully deleted.",
        variant: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error('Error deleting workout:', err);
    }
  }, [deleteWorkoutFromContext, toast]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  const toggleDarkMode = (checked) => {
    setIsDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    try { localStorage.setItem('theme', checked ? 'dark' : 'light'); } catch {}
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={() => loadWorkouts({ force: true })} />;
    if (workouts.length === 0) return <EmptyState onCreateWorkout={() => navigate("/workout/exercise-selector")} />;

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
            <h1 className="text-3xl font-bold">FitApp</h1>
            <p className="text-muted-foreground">Track your workouts</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open settings">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
                  <div className="text-sm">Dark mode</div>
                  <Switch checked={isDark} onCheckedChange={toggleDarkMode} aria-label="Toggle dark mode" />
                </div>
                <Button
                  variant="ghostDestructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {renderContent()}

      </div>
      <Toaster />
    </>
  );
}