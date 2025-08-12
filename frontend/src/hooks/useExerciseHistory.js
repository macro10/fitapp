import { useState, useEffect } from 'react';
import { getWorkouts } from '../api';

const useExerciseHistory = () => {
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const workouts = await getWorkouts();
        console.log('Fetched workouts:', workouts);
        
        const history = {};

        workouts.forEach(workout => {
          workout.performed_exercises.forEach(performedExercise => {
            // Get the exercise ID from the nested exercise object
            const exerciseId = performedExercise.exercise.id;
            console.log('Processing exercise with ID:', exerciseId);

            if (!history[exerciseId]) {
              history[exerciseId] = {
                maxWeight: 0,
                maxReps: 0,
                lastWeight: 0,
                lastReps: 0
              };
            }

            // Find the highest weight and its corresponding reps
            const maxWeightIndex = performedExercise.weights_per_set.reduce((maxIdx, weight, idx) => {
              return weight > performedExercise.weights_per_set[maxIdx] ? idx : maxIdx;
            }, 0);

            const weight = performedExercise.weights_per_set[maxWeightIndex];
            const reps = performedExercise.reps_per_set[maxWeightIndex];

            console.log(`Exercise ${exerciseId} - Current max: ${history[exerciseId].maxWeight}, New: ${weight}`);

            if (weight > history[exerciseId].maxWeight) {
              history[exerciseId].maxWeight = weight;
              history[exerciseId].maxReps = reps;
            }

            // Update last used weight and reps
            const lastSetIndex = performedExercise.weights_per_set.length - 1;
            history[exerciseId].lastWeight = performedExercise.weights_per_set[lastSetIndex];
            history[exerciseId].lastReps = performedExercise.reps_per_set[lastSetIndex];
          });
        });

        console.log('Final exercise history:', history);
        setExerciseHistory(history);
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getExerciseDefaults = (exerciseId) => {
    console.log('Getting defaults for exercise:', exerciseId);
    console.log('Current exercise history:', exerciseHistory);
    
    // Convert exerciseId to number if it's a string
    const numericId = typeof exerciseId === 'string' ? parseInt(exerciseId, 10) : exerciseId;
    const defaults = exerciseHistory[numericId];
    console.log('Found defaults:', defaults);
    
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
    loading
  };
};

export default useExerciseHistory;