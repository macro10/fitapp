import { ExerciseSelector } from './ExerciseSelector';
import { CompletedExercises } from './CompletedExercises';
import { useExerciseContext } from '../../contexts/ExerciseContext';
import { Button } from '../ui/button';

export function ExerciseSelectionFlow({ 
  onExerciseSelect, 
  workoutExercises, 
  onFinishWorkout 
}) {
  const { exercises, loading } = useExerciseContext();

  return (
    <div className="space-y-4">
      <CompletedExercises
        workoutExercises={workoutExercises}
        exercises={exercises}
        loading={loading}
      />
      <ExerciseSelector
        exercises={exercises}
        onSelect={onExerciseSelect}
        loading={loading}
      />
      {workoutExercises.length > 0 && (
        <Button
          className="w-full"
          onClick={onFinishWorkout}
          disabled={loading || !exercises?.length}
        >
          Finish Workout
        </Button>
      )}
    </div>
  );
}
