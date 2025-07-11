// frontend/src/components/workoutLogger/SetLogger.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";

export const SetLogger = ({ setNumber, onComplete, onBack }) => {
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
};


