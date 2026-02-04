import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../apiClient';

export const EXERCISES_QUERY_KEY = ['exercises'];

async function fetchExercises() {
  const res = await api.get('exercises/');
  return Array.isArray(res.data) ? res.data : [];
}

export function useExercisesQuery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading, error, refetch } = useQuery({
    queryKey: EXERCISES_QUERY_KEY,
    queryFn: fetchExercises,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: EXERCISES_QUERY_KEY });
    }
  }, [user, queryClient]);

  // Derived exerciseMap
  const exerciseMap = useMemo(() => {
    const map = {};
    for (const ex of exercises) map[ex.id] = ex;
    return map;
  }, [exercises]);

  // setExercises for optimistic updates
  const setExercises = useCallback((updater) => {
    queryClient.setQueryData(EXERCISES_QUERY_KEY, (prev = []) =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  }, [queryClient]);

  // loadExercises with same signature as before
  // Without force: no-op (React Query auto-fetches on mount)
  // With force: invalidate cache and refetch
  const loadExercises = useCallback(async ({ force = false } = {}) => {
    if (force) {
      await queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY });
      return refetch();
    }
    // Non-force calls are no-ops - React Query handles initial fetch automatically
    return Promise.resolve({ data: exercises });
  }, [queryClient, refetch, exercises]);

  const refresh = useCallback(() => loadExercises({ force: true }), [loadExercises]);

  return {
    exercises,
    exerciseMap,
    loading: isLoading,
    error,
    loadExercises,
    refresh,
    setExercises,
  };
}
