import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronLeft, SaveIcon, X } from "lucide-react";
import { SwipeableRow } from "../ui/swipeable-row";
import { useToast } from "../../hooks/use-toast";

const ReviewStep = ({ exercise, sets, onConfirm, onBack, onRemoveSet }) => {
  const { toast } = useToast();

  const handleRemoveSet = (i) => {
    onRemoveSet?.(i);
    toast({
      title: "Set deleted",
      description: "Removed from exercise.",
      variant: "success",
      duration: 1800,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{exercise.name}</h2>
        <p className="text-sm text-muted-foreground">Review your sets</p>
      </div>
      
      <div className="space-y-2">
        {sets.map((set, index) => (
          <SwipeableRow
            key={index}
            onDelete={() => handleRemoveSet(index)}
            actionLabel="Delete"
          >
            <Card>
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
                        onClick={() => handleRemoveSet(index)}
                        className="hidden sm:inline-flex"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SwipeableRow>
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