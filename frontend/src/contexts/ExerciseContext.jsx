import { createContext, useContext } from 'react';
import { useExercises } from '../hooks/useExercises';

const ExerciseContext = createContext(null);

export function ExerciseProvider({ children }) {
  const exerciseState = useExercises();
  
  return (
    <ExerciseContext.Provider value={exerciseState}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExerciseContext() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
}
