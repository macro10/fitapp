import { useState, useEffect } from 'react';
import { useWorkouts } from '../contexts/WorkoutContext';

const useExerciseHistory = () => {
  const { workouts } = useWorkouts();
  const [exerciseHistory, setExerciseHistory] = useState({});

  useEffect(() => {
    const history = {};
    (workouts || []).forEach(workout => {
      (workout.performed_exercises || []).forEach(performedExercise => {
        const exerciseId = performedExercise.exercise.id;
        if (!history[exerciseId]) {
          history[exerciseId] = {
            maxWeight: 0,
            maxReps: 0,
            lastWeight: 0,
            lastReps: 0
          };
        }
        const maxWeightIndex = performedExercise.weights_per_set.reduce((maxIdx, weight, idx) => {
          return weight > performedExercise.weights_per_set[maxIdx] ? idx : maxIdx;
        }, 0);

        const weight = performedExercise.weights_per_set[maxWeightIndex];
        const reps = performedExercise.reps_per_set[maxWeightIndex];

        if (weight > history[exerciseId].maxWeight) {
          history[exerciseId].maxWeight = weight;
          history[exerciseId].maxReps = reps;
        }

        const lastSetIndex = performedExercise.weights_per_set.length - 1;
        history[exerciseId].lastWeight = performedExercise.weights_per_set[lastSetIndex];
        history[exerciseId].lastReps = performedExercise.reps_per_set[lastSetIndex];
      });
    });
    setExerciseHistory(history);
  }, [workouts]);

  const getExerciseDefaults = (exerciseId) => {
    const numericId = typeof exerciseId === 'string' ? parseInt(exerciseId, 10) : exerciseId;
    const defaults = exerciseHistory[numericId];
    if (!defaults) {
      return { defaultReps: "10", defaultWeight: "45" };
    }
    return {
      defaultReps: defaults.maxReps.toString(),
      defaultWeight: defaults.maxWeight.toString()
    };
  };

  return {
    getExerciseDefaults,
  };
};

export default useExerciseHistory;