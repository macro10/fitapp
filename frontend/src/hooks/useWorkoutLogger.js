import { useState, useEffect } from 'react';
import { createWorkoutWithExercises } from "../api";
import { useNavigate } from "react-router-dom";
import { useExerciseContext } from '../contexts/ExerciseContext';

export const WORKOUT_STORAGE_KEY = 'inProgressWorkout';
export const CURRENT_EXERCISE_STORAGE_KEY = 'inProgressExercise';
export const REST_TIMER_KEY = 'workout_rest_timer_start'; // Add this constant

// Add this mapping object at the top of the file
const MUSCLE_GROUP_MAPPING = {
  'legs': 'leg',
  'shoulders': 'shoulder',
  'arms': 'arm',
  'chest': 'chest', // Some words stay the same
  'back': 'back',
  'core': 'core',
  // Add any other muscle groups that need mapping
};

// Helper function to get singular form of muscle group
const getSingularForm = (muscleGroup) => {
  return MUSCLE_GROUP_MAPPING[muscleGroup.toLowerCase()] || muscleGroup;
};

// Helper function to generate smart workout name
const generateWorkoutName = (workoutExercises, exerciseMap) => {
  // If no exercises, return default name
  if (!workoutExercises.length) return "Untitled Workout";

  // Count exercises by muscle group
  const muscleGroupCounts = workoutExercises.reduce((counts, exercise) => {
    const muscleGroup = exerciseMap[exercise.exercise]?.muscle_group;
    if (muscleGroup) {
      counts[muscleGroup] = (counts[muscleGroup] || 0) + 1;
    }
    return counts;
  }, {});

  // Sort muscle groups by count (descending)
  const sortedMuscleGroups = Object.entries(muscleGroupCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([group]) => getSingularForm(group)); // Apply singular form here

  // Capitalize first letter of each muscle group
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Generate name based on number of muscle groups
  if (sortedMuscleGroups.length === 0) return "Untitled Workout";
  if (sortedMuscleGroups.length === 1) {
    return `${capitalize(sortedMuscleGroups[0])} Workout`;
  }
  if (sortedMuscleGroups.length === 2) {
    return `${capitalize(sortedMuscleGroups[0])} and ${capitalize(sortedMuscleGroups[1])} Workout`;
  }
  // If more than 2 muscle groups, use the top 2 by exercise count
  return `${capitalize(sortedMuscleGroups[0])} and ${capitalize(sortedMuscleGroups[1])} Workout`;
};

export const useWorkoutLogger = () => {
  // Initialize state from localStorage with both exercises and name
  const [workoutState, setWorkoutState] = useState(() => {
    const saved = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (!saved) {
      return {
        exercises: [],
        name: "Untitled Workout",
        isCustomName: false
      };
    }
    
    // Handle both old and new format
    const parsedData = JSON.parse(saved);
    if (Array.isArray(parsedData)) {
      return {
        exercises: parsedData,
        name: "Untitled Workout",
        isCustomName: false
      };
    }
    return {
      ...parsedData,
      isCustomName: parsedData.isCustomName || false
    };
  });

  const { exercises } = useExerciseContext();
  const [exerciseMap, setExerciseMap] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Effect to update exercise map when available
  useEffect(() => {
    if (exercises.length > 0) {
      const map = exercises.reduce((acc, exercise) => {
        acc[exercise.id] = exercise;
        return acc;
      }, {});
      setExerciseMap(map);
    }
  }, [exercises]);

  // Effect to update workout name when exercises change
  useEffect(() => {
    if (!workoutState.isCustomName && Object.keys(exerciseMap).length > 0) {
      const smartName = generateWorkoutName(workoutState.exercises, exerciseMap);
      setWorkoutState(prev => ({
        ...prev,
        name: smartName
      }));
    }
  }, [workoutState.exercises, exerciseMap, workoutState.isCustomName]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workoutState));
  }, [workoutState]);

  const setWorkoutName = (name) => {
    setWorkoutState(prev => ({
      ...prev,
      name,
      isCustomName: true // Set flag when user manually changes name
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
      exercises: [...prev.exercises, formattedExercise]
    }));
  };

  const handleFinishWorkout = async () => {
    try {
      await createWorkoutWithExercises(
        new Date().toISOString(),
        workoutState.exercises,
        workoutState.name
      );
      localStorage.removeItem(WORKOUT_STORAGE_KEY);
      localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
      localStorage.removeItem(REST_TIMER_KEY); // Add this line
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    }
  };

  const clearWorkout = () => {
    localStorage.removeItem(WORKOUT_STORAGE_KEY);
    localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
    localStorage.removeItem(REST_TIMER_KEY); // Add this line
    setWorkoutState({
      exercises: [],
      name: "Untitled Workout",
      isCustomName: false
    });
  };

  return {
    workoutExercises: workoutState.exercises,
    workoutName: workoutState.name,
    setWorkoutName,
    error,
    addExerciseToWorkout,
    handleFinishWorkout,
    clearWorkout
  };
};
