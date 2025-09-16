import { useState, useEffect } from 'react';
import { getExercises } from '../api';

// Cache outside the hook
let exerciseCache = null;

export function useExercises(user) {
  const [exercises, setExercises] = useState(exerciseCache || []);
  const [loading, setLoading] = useState(!exerciseCache);
  const [error, setError] = useState(null);

  const loadExercises = async () => {
    // If we have cached data, don't fetch again
    if (exerciseCache) {
      return;
    }

    try {
      setLoading(true);
      const data = await getExercises();
      exerciseCache = data; // Cache the results
      setExercises(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadExercises();
  }, [user]); // Depend on user

  // Add a force refresh function that clears cache
  const forceRefresh = async () => {
    exerciseCache = null;
    await loadExercises();
  };

  return {
    exercises,
    loading,
    error,
    refreshExercises: forceRefresh
  };
}