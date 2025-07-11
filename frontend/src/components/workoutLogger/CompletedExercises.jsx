// frontend/src/components/workoutLogger/CompletedExercises.jsx
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { DumbbellIcon, SaveIcon } from "lucide-react";

export const CompletedExercises = ({ 
  workoutExercises, 
  exercises, 
  onFinish 
}) => {
  if (workoutExercises.length === 0) return null;
  
  return (
    <>
      <div>
        <h3 className="text-sm font-medium mb-3">Completed Exercises</h3>
        <div className="space-y-2">
          {workoutExercises.map((ex, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DumbbellIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{exercises.find(e => e.id === ex.exercise)?.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {ex.sets} {ex.sets === 1 ? 'set' : 'sets'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={onFinish}
      >
        <SaveIcon className="h-4 w-4 mr-2" />
        Finish Workout
      </Button>
    </>
  );
};
