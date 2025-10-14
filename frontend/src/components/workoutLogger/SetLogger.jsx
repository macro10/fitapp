// frontend/src/components/workoutLogger/SetLogger.jsx
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Loader2 } from "lucide-react";
import { WheelPicker, WheelPickerWrapper } from "../../components/ui/wheel-picker";
import { RestTimer } from "./RestTimer";
import { Switch } from "../ui/switch";

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
  const parseDefaultWeight = (dw) => {
    const w = parseFloat(dw);
    if (Number.isNaN(w)) {
      return { base: "45", small: false };
    }
    if (w % 5 === 2.5) {
      return { base: (w - 2.5).toString(), small: true };
    }
    return { base: w.toString(), small: false };
  };

  const { base: initialBaseWeight, small: initialSmall } = parseDefaultWeight(defaultWeight);

  const [reps, setReps] = useState(defaultReps);
  const [weight, setWeight] = useState(initialBaseWeight);
  const [isLoading, setIsLoading] = useState(false);
  const [smallPlate, setSmallPlate] = useState(initialSmall);
  
  // Update state when defaults change
  useEffect(() => {
    setReps(defaultReps);
    const { base, small } = parseDefaultWeight(defaultWeight);
    setSmallPlate(small);
    setWeight(base);
  }, [defaultReps, defaultWeight]);

  const handleNext = async () => {
    if (reps && weight) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      const outWeight = Number(weight) + (smallPlate ? 2.5 : 0);
      onComplete({ 
        reps: Number(reps), 
        weight: outWeight 
      });
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
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Add 2.5 lb</span>
            <Switch checked={smallPlate} onCheckedChange={setSmallPlate} aria-label="Add 2.5 lb" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Effective: {(Number(weight) + (smallPlate ? 2.5 : 0)).toString()} lbs
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          className="flex-1 h-12 rounded-xl"
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
        <Button variant="outline" className="h-12 rounded-xl" onClick={onBack}>
          {setNumber === 1 ? "Cancel" : "Done"}
        </Button>
      </div>
    </div>
  );
};