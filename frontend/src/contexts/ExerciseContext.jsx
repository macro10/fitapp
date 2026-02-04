import { createContext, useContext } from 'react';
import { useExercisesQuery } from '../hooks/useExercisesQuery';

const ExerciseContext = createContext(null);

export function ExerciseProvider({ children }) {
  const exerciseState = useExercisesQuery();
  return (
    <ExerciseContext.Provider value={exerciseState}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercises() {
  const ctx = useContext(ExerciseContext);
  if (!ctx) throw new Error('useExercises must be used within ExerciseProvider');
  return ctx;
}
