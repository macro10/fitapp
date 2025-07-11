import { useState } from 'react';
import { STEPS } from '../constants/workout'; // You'll need to move STEPS to a constants file

export const useExerciseLogger = () => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [sets, setSets] = useState([]);
  const [step, setStep] = useState(STEPS.SELECT_EXERCISE);

  const handleExerciseSelect = (exercise) => {
    setCurrentExercise(exercise);
    setStep(STEPS.LOG_SETS);
  };

  const handleSetComplete = (setData) => {
    setSets(prevSets => [...prevSets, setData]);
  };

  const resetExerciseState = () => {
    setCurrentExercise(null);
    setSets([]);
    setStep(STEPS.SELECT_EXERCISE);
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
    resetExerciseState,
    setStep,
    getHeaderTitle
  };
};