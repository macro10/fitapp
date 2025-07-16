import { useState, useEffect } from 'react';
import { createWorkoutWithExercises } from "../api";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = 'inProgressWorkout';

export const useWorkoutLogger = () => {
  // Initialize state from localStorage if it exists
  const [workoutExercises, setWorkoutExercises] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Save to localStorage whenever workoutExercises changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutExercises));
  }, [workoutExercises]);

  const addExerciseToWorkout = (exerciseData) => {
    setWorkoutExercises(prev => [...prev, exerciseData]);
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        workoutExercises
      );
      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEY);
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    }
  };

  // Add a method to clear the workout
  const clearWorkout = () => {
    localStorage.removeItem(STORAGE_KEY);
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
