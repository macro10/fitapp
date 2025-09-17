import { useEffect, useState } from "react";
import { ExerciseSelector } from "./ExerciseSelector";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import { SetLogger } from "./SetLogger";
import { CompletedExercises } from "./CompletedExercises";
import { CancelWorkoutDialog } from "./CancelWorkoutDialog";
import { STEPS } from '../../constants/workout';

// Import custom hooks
import { useWorkoutLogger } from '../../hooks/useWorkoutLogger';
import { useExerciseLogger } from '../../hooks/useExerciseLogger';
import { useCancelWorkout } from '../../hooks/useCancelWorkout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { useExercises } from "../../contexts/ExerciseContext";
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
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";

import {
  DumbbellIcon,
  X,
} from "lucide-react";

export default function WorkoutLoggerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    exercises,
    loading: exercisesLoading,
    loadExercises,
  } = useExercises();

  const [loading, setLoading] = useState(true);

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
    clearWorkout();
    resetExerciseState();
    navigate("/");
  };

  const {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  } = useCancelWorkout(hasUnsavedWork, handleCancelConfirm);

  const { getExerciseDefaults } = useExerciseHistory();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Load exercises from context (cache + revalidate)
    loadExercises().catch(() => {});
  }, [user, navigate, loadExercises]);

  useEffect(() => {
    // local spinner to smooth UI on first mount
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  const handleExerciseComplete = () => {
    const exerciseData = {
      exercise: currentExercise.id,
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
                    style={{ fontSize: '24px' }}
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
                    loading={loading || exercisesLoading}
                  />
                  <ExerciseSelector
                    exercises={exercises}
                    onSelect={handleExerciseSelect}
                  />
                  {workoutExercises.length > 0 && (
                    <Button
                      className="w-full"
                      onClick={handleFinishWorkout}
                      disabled={loading || exercisesLoading || !exercises?.length}
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
                      if (sets.length > 0) {
                        const lastSet = sets[sets.length - 1];
                        const lastWeight = lastSet.weight;
                        const historyWeight = parseInt(defaults.defaultWeight, 10);
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
            onConfirm={handleCancelConfirm}
          />
        </div>
      </div>
    </div>
  );
}