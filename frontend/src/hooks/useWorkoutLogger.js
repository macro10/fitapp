import { useState, useEffect } from 'react';
import { createWorkoutWithExercises } from "../api";
import { useNavigate } from "react-router-dom";

export const WORKOUT_STORAGE_KEY = 'inProgressWorkout';
export const CURRENT_EXERCISE_STORAGE_KEY = 'inProgressExercise';

export const useWorkoutLogger = () => {
  const [workoutExercises, setWorkoutExercises] = useState(() => {
    const saved = localStorage.getItem(WORKOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workoutExercises));
  }, [workoutExercises]);

  const addExerciseToWorkout = (exerciseData) => {
    // Store both the ID and the exercise details
    const formattedExercise = {
      exercise: exerciseData.exercise, // Store the ID
      sets: exerciseData.sets,
      reps_per_set: exerciseData.reps_per_set,
      weights_per_set: exerciseData.weights_per_set,
    };
    setWorkoutExercises(prev => [...prev, formattedExercise]);
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        workoutExercises
      );
      // Clear both storage keys after successful save
      localStorage.removeItem(WORKOUT_STORAGE_KEY);
      localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    }
  };

  const clearWorkout = () => {
    localStorage.removeItem(WORKOUT_STORAGE_KEY);
    localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
    setWorkoutExercises([]);
  };

  return {
    workoutExercises,
    error,
    addExerciseToWorkout,
    handleFinishWorkout,
    clearWorkout
  };
};
