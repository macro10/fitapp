import { useEffect, useState } from "react";
import { ExerciseSelector } from "./ExerciseSelector";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import { SetLogger } from "./SetLogger";
import { getExercises } from "../../api";
import { STEPS } from '../../constants/workout';

// Import custom hooks
import { useWorkoutLogger } from '../../hooks/useWorkoutLogger';
import { useExerciseLogger } from '../../hooks/useExerciseLogger';
import { useCancelWorkout } from '../../hooks/useCancelWorkout';
import { useNavigate } from 'react-router-dom';

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

// Dialog imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// Icon imports
import {
  DumbbellIcon,
  SaveIcon,
  X,
} from "lucide-react";

// Main component with organized sections
export default function WorkoutLoggerPage() {
  const navigate = useNavigate();
  // Custom hooks
  const {
    workoutExercises,
    error,
    addExerciseToWorkout,
    handleFinishWorkout
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
  } = useCancelWorkout(hasUnsavedWork);

  // Local state
  const [exercises, setExercises] = useState([]);

  // Effects
  useEffect(() => {
    getExercises().then(setExercises);
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

  // 5. Render helpers
  const renderCompletedExercises = () => (
    workoutExercises.length > 0 && (
      <>
        <div>
          <h3 className="text-sm font-medium mb-3">Completed Exercises</h3>
          <div className="space-y-2">
            {workoutExercises.map((ex, i) => (
              <Card key={i}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DumbbellIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{exercises.find(e => e.id === ex.exercise)?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ex.sets} {ex.sets === 1 ? 'set' : 'sets'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleFinishWorkout}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Finish Workout
        </Button>
      </>
    )
  );

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto"> {/* Changed from max-w-md to max-w-2xl and wrapped in a div */}
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
                
                {/* Moved completed exercises section here */}
                {renderCompletedExercises()}
              </div>
            )}

            {step === STEPS.LOG_SETS && (
              <SetLogger
                setNumber={sets.length + 1}
                onComplete={handleSetComplete}
                onBack={() => {
                  if (sets.length === 0) {
                    setStep(STEPS.SELECT_EXERCISE);
                    // setCurrentExercise(null); // This line was removed from useExerciseLogger
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

        {/* Add the AlertDialog component */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" />
                Cancel Workout?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to cancel this workout? All progress will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="flex-1">
                Continue Workout
              </AlertDialogCancel>
              <AlertDialogAction 
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => navigate("/")}
              >
                Cancel Workout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}