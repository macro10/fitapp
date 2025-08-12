// frontend/src/components/workoutLogger/SetLogger.jsx
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Loader2, Timer } from "lucide-react"; // Add Loader2 and Timer import
import { WheelPicker, WheelPickerWrapper } from "../../components/ui/wheel-picker";
import { RestTimer } from "./RestTimer";
import { getWorkouts } from '../../api';

// Helper function to create arrays of options
const createOptions = (length, add = 0, step = 1) => 
  Array.from({ length }, (_, i) => {
    const value = (i * step) + add;
    return {
      label: value.toString(),
      value: value.toString(),
    };
  });

// Create options for reps (1-30) and weights (0-500 by 5s)
const repOptions = createOptions(30, 1); // 1-30 reps
const weightOptions = createOptions(101, 0, 5); // 0-500 in steps of 5

export const SetLogger = ({ setNumber, onComplete, onBack, defaultReps = "10", defaultWeight = "45" }) => {
  console.log('SetLogger props:', { defaultReps, defaultWeight }); // Debug log
  const [reps, setReps] = useState(defaultReps);
  const [weight, setWeight] = useState(defaultWeight);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update state when defaults change
  useEffect(() => {
    setReps(defaultReps);
    setWeight(defaultWeight);
  }, [defaultReps, defaultWeight]);

  const handleNext = async () => {
    if (reps && weight) {
      setIsLoading(true);
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onComplete({ 
        reps: Number(reps), 
        weight: Number(weight) 
      });
      
      // Reset the rest timer by updating the start time in localStorage
      localStorage.setItem("workout_rest_timer_start", Date.now().toString());
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
          Set {setNumber}
        </h2>
        <RestTimer />
      </div>
      {/* Change this div to use flex and gap instead of space-y */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground block mb-2">
            How many reps?
          </label>
          <div className="rounded-lg border bg-background">
            <WheelPickerWrapper>
              <WheelPicker 
                options={repOptions} 
                defaultValue={reps}
                onValueChange={setReps}
                infinite={false}
              />
            </WheelPickerWrapper>
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm text-muted-foreground block mb-2">
            What weight (lbs)?
          </label>
          <div className="rounded-lg border bg-background">
            <WheelPickerWrapper>
              <WheelPicker 
                options={weightOptions}
                defaultValue={weight}
                onValueChange={setWeight}
                infinite={false}
              />
            </WheelPickerWrapper>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          className="flex-1"
          onClick={handleNext}
          disabled={!reps || !weight || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              Add Set
              <Plus className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onBack}>
          Done
        </Button>
      </div>
    </div>
  );
};


