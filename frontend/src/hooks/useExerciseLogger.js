import { useState, useEffect } from 'react';
import { STEPS } from '../constants/workout';

const CURRENT_EXERCISE_STORAGE_KEY = 'inProgressExercise';

export const useExerciseLogger = () => {
  // Initialize state from localStorage if it exists
  const [currentState, setCurrentState] = useState(() => {
    const saved = localStorage.getItem(CURRENT_EXERCISE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      exercise: null,
      sets: [],
      step: STEPS.SELECT_EXERCISE
    };
  });

  const [currentExercise, setCurrentExercise] = useState(currentState.exercise);
  const [sets, setSets] = useState(currentState.sets);
  const [step, setStep] = useState(currentState.step);

  // Save current exercise state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      exercise: currentExercise,
      sets,
      step
    };
    
    if (currentExercise || sets.length > 0) {
      localStorage.setItem(CURRENT_EXERCISE_STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
    }
  }, [currentExercise, sets, step]);

  const handleExerciseSelect = (exercise) => {
    setCurrentExercise(exercise);
    setStep(STEPS.LOG_SETS);
  };

  const handleSetComplete = (setData) => {
    setSets(prevSets => [...prevSets, setData]);
  };

  const removeSetAtIndex = (index) => {
    setSets(prev => prev.filter((_, i) => i !== index));
  };

  const resetExerciseState = () => {
    setCurrentExercise(null);
    setSets([]);
    setStep(STEPS.SELECT_EXERCISE);
    localStorage.removeItem(CURRENT_EXERCISE_STORAGE_KEY);
  };

  const getHeaderTitle = () => {
    if (!currentExercise) return "Log Exercises";
    if (step === STEPS.LOG_SETS) return "Log Sets";
    if (step === STEPS.REVIEW) return "Review Exercise";
    return "Log Workout";
  };

  return {
    currentExercise,
    sets,
    step,
    handleExerciseSelect,
    handleSetComplete,
    removeSetAtIndex,
    resetExerciseState,
    setStep,
    getHeaderTitle
  };
};