import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createWorkoutWithExercises } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { ChevronLeft, DumbbellIcon, SaveIcon, Plus, X } from "lucide-react";
import { cn } from "../lib/utils";
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

// Step indicator component
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full flex-1 transition-all",
            i === currentStep ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

// Exercise selector step
function ExerciseSelector({ exercises, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {search || "Add exercise..."}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search exercises..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {exercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={() => {
                    onSelect(exercise);
                    setOpen(false);
                  }}
                >
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Set logging step
function SetLogger({ setNumber, onComplete, onBack }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    if (reps && weight) {
      onComplete({ reps: Number(reps), weight: Number(weight) });
      setReps("");
      setWeight("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Set {setNumber}</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            How many reps?
          </label>
          <Input
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Enter number of reps"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            What weight (lbs)?
          </label>
          <Input
            type="number"
            min={0}
            step={5}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in lbs"
            className="w-full"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          className="flex-1"
          onClick={handleNext}
          disabled={!reps || !weight}
        >
          Add Set
          <Plus className="h-4 w-4 ml-2" />
        </Button>
        <Button variant="outline" onClick={onBack}>
          Done
        </Button>
      </div>
    </div>
  );
}

// Review step
function ReviewStep({ exercise, sets, onConfirm, onBack }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{exercise.name}</h2>
        <p className="text-sm text-muted-foreground">Review your sets</p>
      </div>
      
      <div className="space-y-2">
        {sets.map((set, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span>Set {index + 1}</span>
                <span>{set.reps} reps @ {set.weight} lbs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 ml-2" />
          Add Sets
          
        </Button>
        <Button variant="outline" onClick={onConfirm}>
          <SaveIcon className="h-4 w-4 mr-2" />
          Complete Exercise
        </Button>
      </div>
    </div>
  );
}

export default function WorkoutLoggerPage2() {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [sets, setSets] = useState([]);
  const [step, setStep] = useState(0); // 0: select exercise, 1: logging sets, 2: review
  const [error, setError] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleExerciseSelect = (exercise) => {
    setCurrentExercise(exercise);
    setStep(1);
  };

  const handleSetComplete = (setData) => {
    setSets([...sets, setData]);
  };

  const handleExerciseComplete = async () => {
    const exerciseData = {
      exercise: currentExercise.id,
      sets: sets.length,
      reps_per_set: sets.map(s => s.reps),
      weights_per_set: sets.map(s => s.weight)
    };

    setWorkoutExercises([...workoutExercises, exerciseData]);
    
    // Reset for next exercise
    setCurrentExercise(null);
    setSets([]);
    setStep(0);
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        workoutExercises
      );
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    }
  };

  const handleCancelWorkout = () => {
    if (workoutExercises.length > 0 || (currentExercise && sets.length > 0)) {
      setShowCancelDialog(true);
    } else {
      navigate("/");
    }
  };

  // Helper function to get the context-specific title
  const getHeaderTitle = () => {
    if (!currentExercise) {
      return "Log Exercises";
    }
    if (step === 1) {
      return "Log Sets";
    }
    if (step === 2) {
      return "Review Exercise";
    }
    return "Log Workout";
  };

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

            {step === 0 && (
              <div className="space-y-4">
                <ExerciseSelector
                  exercises={exercises}
                  onSelect={handleExerciseSelect}
                />
                
                {/* Moved completed exercises section here */}
                {workoutExercises.length > 0 && (
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
                )}
              </div>
            )}

            {step === 1 && (
              <SetLogger
                setNumber={sets.length + 1}
                onComplete={handleSetComplete}
                onBack={() => {
                  if (sets.length === 0) {
                    setStep(0);
                    setCurrentExercise(null);
                  } else {
                    setStep(2);
                  }
                }}
              />
            )}

            {step === 2 && (
              <ReviewStep
                exercise={currentExercise}
                sets={sets}
                onConfirm={handleExerciseComplete}
                onBack={() => setStep(1)}
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
