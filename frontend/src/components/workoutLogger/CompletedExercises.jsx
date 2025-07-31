// frontend/src/components/workoutLogger/CompletedExercises.jsx
import { DumbbellIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export const CompletedExercises = ({ workoutExercises, exercises, loading = false }) => {
  const exerciseMap = exercises?.reduce((map, exercise) => {
    map[exercise.id] = exercise;
    return map;
  }, {}) || {};

  // If no completed exercises, don't render anything
  if (!workoutExercises.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Completed Exercises</h2>
      <div className="space-y-2">
        {workoutExercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg
                     backdrop-blur-md bg-white/60 
                     border border-indigo-100
                     shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-indigo-50">
                <DumbbellIcon className="h-5 w-5 text-indigo-600" />
              </div>
              {loading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="font-medium text-slate-800">
                  {exerciseMap[exercise.exercise]?.name || 'Unknown Exercise'}
                </span>
              )}
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
              {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
