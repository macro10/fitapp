import { createContext, useContext } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useAuth } from '../contexts/AuthContext'; // Update this import path based on where you move AuthContext

const ExerciseContext = createContext(null);

export function ExerciseProvider({ children }) {
  const { user } = useAuth();
  const exerciseState = useExercises(user); // Pass user to useExercises
  
  // If not authenticated, just render children without exercise data
  if (!user) {
    return children;
  }
  
  return (
    <ExerciseContext.Provider value={exerciseState}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExerciseContext() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider and with authenticated user');
  }
  return context;
}
