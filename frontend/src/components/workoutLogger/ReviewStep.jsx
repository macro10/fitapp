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
};

export { ReviewStep }