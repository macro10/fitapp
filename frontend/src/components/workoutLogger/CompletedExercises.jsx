// frontend/src/components/workoutLogger/CompletedExercises.jsx
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { DumbbellIcon, SaveIcon } from "lucide-react";

export const CompletedExercises = ({ workoutExercises, exercises, onFinish }) => {
  // Create a map of exercise IDs to exercise objects for quick lookup
  const exerciseMap = exercises.reduce((map, exercise) => {
    map[exercise.id] = exercise;
    return map;
  }, {});

  return (
    <div className="space-y-4">
      {workoutExercises.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Completed Exercises</h2>
          <div className="space-y-2">
            {workoutExercises.map((exercise, index) => {
              const exerciseDetails = exerciseMap[exercise.exercise];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <DumbbellIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {exerciseDetails?.name || 'Unknown Exercise'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
                  </span>
                </div>
              );
            })}
          </div>
          <Button
            className="w-full"
            onClick={onFinish}
          >
            Finish Workout
          </Button>
        </>
      )}
    </div>
  );
};
