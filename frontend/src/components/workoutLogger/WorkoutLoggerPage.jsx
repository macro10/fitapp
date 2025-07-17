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
    setStep,
    getHeaderTitle
  } = useExerciseLogger();

  const hasUnsavedWork = workoutExercises.length > 0 || (currentExercise && sets.length > 0);
  const {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  } = useCancelWorkout(hasUnsavedWork, clearWorkout);

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

  const handleCancelConfirm = () => {
    clearWorkout(); // Clear workout data from localStorage
    resetExerciseState(); // Reset current exercise state
    navigate("/"); // Navigate back to list
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <DumbbellIcon className="h-6 w-6" />
                {getHeaderTitle()}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelWorkout}
                title="Cancel Workout"
                className="text-muted-foreground hover:text-destructive transition-colors"
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
                <ExerciseSelector
                  exercises={exercises}
                  onSelect={handleExerciseSelect}
                />
                <CompletedExercises
                  workoutExercises={workoutExercises}
                  exercises={exercises}
                  onFinish={handleFinishWorkout}
                  loading={loading}
                />
              </div>
            )}

            {step === STEPS.LOG_SETS && (
              <SetLogger
                setNumber={sets.length + 1}
                onComplete={handleSetComplete}
                onBack={() => {
                  if (sets.length === 0) {
                    setStep(STEPS.SELECT_EXERCISE);
                  } else {
                    setStep(STEPS.REVIEW);
                  }
                }}
              />
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
  );
}