import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronLeft, SaveIcon, X } from "lucide-react";

const ReviewStep = ({ exercise, sets, onConfirm, onBack, onRemoveSet }) => {
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
                <div className="flex items-center gap-3">
                  <span>{set.reps} reps @ {set.weight} lbs</span>
                  {onRemoveSet && (
                    <Button
                      variant="ghostDestructive"
                      size="icon"
                      aria-label={`Delete set ${index + 1}`}
                      onClick={() => onRemoveSet(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1 h-12 rounded-xl"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 ml-2" />
          Add Sets
          
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={onConfirm}
          disabled={sets.length === 0}
          title={sets.length === 0 ? "Add at least one set" : undefined}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Complete Exercise
        </Button>
      </div>
    </div>
  );
};

export { ReviewStep }