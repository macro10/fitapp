import { useState } from 'react';
import { createWorkoutWithExercises } from "../api";
import { useNavigate } from "react-router-dom";

export const useWorkoutLogger = () => {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const addExerciseToWorkout = (exerciseData) => {
    setWorkoutExercises(prev => [...prev, exerciseData]);
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        workoutExercises
      );
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    }
  };

  return {
    workoutExercises,
    error,
    addExerciseToWorkout,
    handleFinishWorkout
  };
};
