// frontend/src/components/workoutLogger/CompletedExercises.jsx
import { DumbbellIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export const CompletedExercises = ({ workoutExercises, exercises, loading = false }) => {
  // Only create the exercise map if exercises array exists and has items
  const exerciseMap = exercises?.reduce((map, exercise) => {
    map[exercise.id] = exercise;
    return map;
  }, {}) || {};

  if (!workoutExercises.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Completed Exercises</h2>
      <div className="space-y-2">
        {workoutExercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-2">
              <DumbbellIcon className="h-5 w-5 text-muted-foreground" />
              {loading || !exercises?.length ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="font-medium">
                  {exerciseMap[exercise.exercise]?.name || 'Unknown Exercise'}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
