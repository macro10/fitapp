import { useEffect, useState } from "react";
import { ExerciseSelector } from "./ExerciseSelector";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import { SetLogger } from "./SetLogger";
import { CompletedExercises } from "./CompletedExercises";
import { CancelWorkoutDialog } from "./CancelWorkoutDialog";
import { getExercises } from "../../api";
import { STEPS } from '../../constants/workout';

// Import custom hooks
import { useWorkoutLogger } from '../../hooks/useWorkoutLogger';
import { useExerciseLogger } from '../../hooks/useExerciseLogger';
import { useCancelWorkout } from '../../hooks/useCancelWorkout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../App"; // Make sure we import useAuth
import useExerciseHistory from '../../hooks/useExerciseHistory';

// UI Component imports
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";

import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input"; // Add this import if not already present
import { Skeleton } from "../ui/skeleton";

// Icon imports
import {
  DumbbellIcon,
  X,
} from "lucide-react";

// Main component with organized sections
export default function WorkoutLoggerPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get auth state
  const [loading, setLoading] = useState(true);
  // Custom hooks
  const {
    workoutExercises,
    workoutName,
    setWorkoutName,
    error,
    addExerciseToWorkout,
    handleFinishWorkout,
    clearWorkout
  } = useWorkoutLogger();

  const {
    currentExercise,
    sets,
    step,
    handleExerciseSelect,
    handleSetComplete,
    resetExerciseState,
    setStep
  } = useExerciseLogger();

  const hasUnsavedWork = workoutExercises.length > 0 || 
    (currentExercise && sets.length > 0) || 
    (workoutName !== "Untitled Workout");

  const handleCancelConfirm = () => {
    clearWorkout(); // Clear workout data from localStorage
    resetExerciseState(); // Reset current exercise state
    navigate("/"); // Navigate back to list
  };

  // Update the useCancelWorkout hook usage to always clear state
  const {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  } = useCancelWorkout(hasUnsavedWork, handleCancelConfirm);

  const { getExerciseDefaults } = useExerciseHistory();

  // Local state
  const [exercises, setExercises] = useState([]);

  // Effects
  // Check auth and load exercises
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const loadExercises = async () => {
      try {
        setLoading(true);
        const data = await getExercises();
        console.log("Loaded exercises:", data); // Add this line
        setExercises(data);
      } catch (err) {
        console.error("Failed to load exercises:", err);
        // If we get a 401, redirect to auth
        if (err.response?.status === 401) {
          navigate("/auth");
        }
      } finally {
        // Add a small delay before setting loading to false to prevent flicker
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    };

    loadExercises();
  }, [user, navigate]);

  const handleExerciseComplete = () => {
    const exerciseData = {
      exercise: currentExercise.id, // Make sure we're using the ID
      sets: sets.length,
      reps_per_set: sets.map((s) => s.reps),
      weights_per_set: sets.map((s) => s.weight),
    };

    addExerciseToWorkout(exerciseData);
    resetExerciseState();
  };

  return (
    <div className="min-h-screen pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 flex-grow">
                  <Input
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="font-bold text-2xl h-12 border rounded-md focus-visible:ring-1 focus-visible:ring-offset-0"
                    style={{ fontSize: '24px' }}  // Adding explicit font size
                    placeholder="Untitled Workout"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelWorkout}
                  title="Cancel Workout"
                  className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {currentExercise && (
                <StepIndicator 
                  currentStep={step - 1} 
                  totalSteps={2}
                />
              )}

              {step === STEPS.SELECT_EXERCISE && (
                <div className="space-y-4">
                  <CompletedExercises
                    workoutExercises={workoutExercises}
                    exercises={exercises}
                    loading={loading}
                  />
                  <ExerciseSelector
                    exercises={exercises}
                    onSelect={handleExerciseSelect}
                  />
                  {workoutExercises.length > 0 && (
                    <Button
                      className="w-full"
                      onClick={handleFinishWorkout}
                      disabled={loading || !exercises?.length}
                    >
                      Finish Workout
                    </Button>
                  )}
                </div>
              )}

              {step === STEPS.LOG_SETS && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SetLogger
                    key={sets.length}
                    setNumber={sets.length + 1}
                    onComplete={handleSetComplete}
                    onBack={() => {
                      if (sets.length === 0) {
                        setStep(STEPS.SELECT_EXERCISE);
                      } else {
                        setStep(STEPS.REVIEW);
                      }
                    }}
                    {...(() => {
                      const defaults = getExerciseDefaults(currentExercise.id);
                      
                      // If we have a previous set in this workout, compare it with the historical max
                      if (sets.length > 0) {
                        const lastSet = sets[sets.length - 1];
                        const lastWeight = lastSet.weight;
                        const historyWeight = parseInt(defaults.defaultWeight, 10);
                        
                        // Use the last set's values if:
                        // 1. There's no history (defaults are 10/45)
                        // 2. OR the last set's weight is greater than the historical max
                        if (defaults.defaultWeight === "45" || lastWeight >= historyWeight) {
                          return {
                            defaultReps: lastSet.reps.toString(),
                            defaultWeight: lastSet.weight.toString()
                          };
                        }
                      }
                      
                      return defaults;
                    })()}
                  />
                </div>
              )}

              {step === STEPS.REVIEW && (
                <ReviewStep
                  exercise={currentExercise}
                  sets={sets}
                  onConfirm={handleExerciseComplete}
                  onBack={() => setStep(STEPS.LOG_SETS)}
                />
              )}
            </CardContent>
          </Card>

          <CancelWorkoutDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={handleCancelConfirm} // Use the new handler
          />
        </div>
      </div>
    </div>
  );
}