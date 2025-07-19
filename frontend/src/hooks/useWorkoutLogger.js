import { useState, useEffect } from 'react';
import { createWorkoutWithExercises } from "../api";
import { useNavigate } from "react-router-dom";

export const WORKOUT_STORAGE_KEY = 'inProgressWorkout';
export const CURRENT_EXERCISE_STORAGE_KEY = 'inProgressExercise';

export const useWorkoutLogger = () => {
  // Initialize state from localStorage with both exercises and name
  const [workoutState, setWorkoutState] = useState(() => {
    const saved = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (!saved) {
      return {
        exercises: [],
        name: "Untitled Workout"
      };
    }
    
    // Handle both old and new format
    const parsedData = JSON.parse(saved);
    if (Array.isArray(parsedData)) {
      // Old format - just an array of exercises
      return {
        exercises: parsedData,
        name: "Untitled Workout"
      };
    }
    // New format - object with exercises and name
    return parsedData;
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Derive individual states from workoutState
  const workoutExercises = workoutState.exercises || [];
  const workoutName = workoutState.name || "Untitled Workout";

  // Save both exercises and name to localStorage whenever either changes
  useEffect(() => {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workoutState));
  }, [workoutState]);

  const setWorkoutName = (name) => {
    setWorkoutState(prev => ({
      ...prev,
      name
    }));
  };

  const addExerciseToWorkout = (exerciseData) => {
    const formattedExercise = {
      exercise: exerciseData.exercise,
      sets: exerciseData.sets,
      reps_per_set: exerciseData.reps_per_set,
      weights_per_set: exerciseData.weights_per_set,
    };
    setWorkoutState(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), formattedExercise]
    }));
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        workoutExercises,
        workoutName
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
    setWorkoutState({
      exercises: [],
      name: "Untitled Workout"
    });
  };

  return {
    workoutExercises,
    workoutName,
    setWorkoutName,
    error,
    addExerciseToWorkout,
    handleFinishWorkout,
    clearWorkout
  };
};
