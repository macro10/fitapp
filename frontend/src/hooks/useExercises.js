import { useState, useEffect } from 'react';
import { getExercises } from '../api';

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Only load exercises once when the hook is first used
  useEffect(() => {
    loadExercises();
  }, []); // Empty dependency array

  return {
    exercises,
    loading,
    error,
    refreshExercises: loadExercises
  };
}
