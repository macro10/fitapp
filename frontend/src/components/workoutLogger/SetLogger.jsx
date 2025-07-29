// frontend/src/components/workoutLogger/SetLogger.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Loader2 } from "lucide-react"; // Add Loader2 import
import { WheelPicker, WheelPickerWrapper } from "../../components/ui/wheel-picker";

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

export const SetLogger = ({ setNumber, onComplete, onBack }) => {
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("45");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNext = async () => {
    if (reps && weight) {
      setIsLoading(true);
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onComplete({ 
        reps: Number(reps), 
        weight: Number(weight) 
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
        Set {setNumber}
      </h2>
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


