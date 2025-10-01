import { useMemo } from 'react';
import { useWorkouts } from '../contexts/WorkoutContext';

const useExerciseRecency = () => {
  const { workouts } = useWorkouts();

  const lastCompletedMap = useMemo(() => {
    const map = {};
    (workouts || []).forEach(w => {
      const ts = new Date(w.date).getTime() || 0;
      const items = w?.performed_exercises || [];
      items.forEach(pe => {
        // Normalize exercise id shape (detail responses usually have pe.exercise.id)
        const id =
          pe?.exercise?.id ??
          pe?.exercise_id ??
          pe?.exercise;
        if (id == null) return;
        if (map[id] == null || ts > map[id]) map[id] = ts;
      });
    });
    return map;
  }, [workouts]);

  const getLastCompletedTs = (exerciseId) => {
    const id = typeof exerciseId === 'string' ? parseInt(exerciseId, 10) : exerciseId;
    return lastCompletedMap[id] || 0;
  };

  return { lastCompletedMap, getLastCompletedTs };
};

export default useExerciseRecency;
