import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronLeft, SaveIcon } from "lucide-react";

const ReviewStep = ({ exercise, sets, onConfirm, onBack }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{exercise.name}</h2>
        <p className="text-sm text-muted-foreground">Review your sets</p>
      </div>
      
      <div className="space-y-4">
        {sets.map((set, index) => (
          <div
            key={index}
            className="p-4 rounded-lg backdrop-blur-md bg-white/60 
                 border border-indigo-100 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Set {index + 1}</span>
              <span className="text-indigo-600">
                {set.reps} reps @ {set.weight} lbs
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white
               shadow-md hover:shadow-lg
               transition-all duration-300"
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
};

export { ReviewStep }