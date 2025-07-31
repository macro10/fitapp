import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronLeft, SaveIcon } from "lucide-react";

const ReviewStep = ({ exercise, sets, onConfirm, onBack }) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{exercise.name}</h2>
        <p className="text-sm text-slate-500">Review your sets</p>
      </div>
      
      {sets.map((set, index) => (
        <div
          key={index}
          className="p-4 rounded-lg backdrop-blur-md bg-white/60 
                 border border-indigo-100/20 shadow-sm
                 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">Set {index + 1}</span>
            <span className="text-indigo-600 font-medium">
              {set.reps} reps @ {set.weight} lbs
            </span>
          </div>
        </div>
      ))}
      
      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
        >
          Back
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          Complete Exercise
        </Button>
      </div>
    </div>
  );
};

export { ReviewStep }