// frontend/src/components/workoutLogger/SetLogger.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
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
  
  // Track the actual selected values separately
  const [selectedReps, setSelectedReps] = useState(reps);
  const [selectedWeight, setSelectedWeight] = useState(weight);

  const handleNext = () => {
    if (reps && weight) {
      console.log('Submitting values:', { reps, weight });
      onComplete({ 
        reps: Number(reps), 
        weight: Number(weight) 
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Set {setNumber}</h2>
      <div className="space-y-8">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            How many reps?
          </label>
          <div className="rounded-lg border bg-background">
            <WheelPickerWrapper>
              <WheelPicker 
                options={repOptions} 
                defaultValue={reps}  // Changed to defaultValue
                onValueChange={(value) => {  // Changed to onValueChange
                  console.log('Reps changing to:', value);
                  setReps(value);
                }}
                infinite={false}
              />
            </WheelPickerWrapper>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            What weight (lbs)?
          </label>
          <div className="rounded-lg border bg-background">
            <WheelPickerWrapper>
              <WheelPicker 
                options={weightOptions}
                defaultValue={weight}  // Changed to defaultValue
                onValueChange={(value) => {  // Changed to onValueChange
                  console.log('Weight changing to:', value);
                  setWeight(value);
                }}
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
};


