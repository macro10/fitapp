# Refactor: Simplify WorkoutContext Caching

**Priority:** Medium Impact | Medium Effort
**Do first if:** Debugging cache issues, or adding more data fetching

## Current State

`WorkoutContext.jsx` is 283 lines handling:

- API fetching with loading states
- localStorage caching with TTL (2 minutes)
- Cache key generation per user (JWT parsing)
- Optimistic delete with rollback barriers
- Detail fetching with request deduplication
- Background prefetching with concurrency limits (MAX=4)
- Debounced cache writes
- Cache versioning and migration (v1 → v2)
- Cleanup on logout

This is a lot of responsibility for one context.

## Problems

1. **Hard to debug:** Cache issues require understanding all the interacting pieces
2. **Hard to test:** Many edge cases (stale cache, concurrent requests, rollback)
3. **Copy-paste risk:** If you add ExerciseContext or AnalyticsContext, you'll duplicate this logic
4. **Coupling:** Caching strategy is tightly coupled to workout domain logic

## Option A: Extract Custom Hooks (Simpler)

Break the monolith into composable pieces:

```
hooks/
├── useApiCache.js          # Generic cache-with-TTL
├── useOptimisticMutation.js # Optimistic update + rollback
├── usePrefetch.js          # Background data loading
└── useWorkouts.js          # Thin domain wrapper
```

### useApiCache.js

```javascript
import { useState, useCallback, useRef } from 'react';

const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes

export function useApiCache(cacheKey, fetcher, { ttl = DEFAULT_TTL } = {}) {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < ttl) return data;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(null);

  const isFresh = useCallback(() => {
    return lastFetchRef.current && (Date.now() - lastFetchRef.current < ttl);
  }, [ttl]);

  const refresh = useCallback(async (force = false) => {
    if (!force && isFresh()) return data;

    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      lastFetchRef.current = Date.now();
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: result }));
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetcher, isFresh, data]);

  const updateCache = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: next }));
      return next;
    });
  }, [cacheKey]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    lastFetchRef.current = null;
  }, [cacheKey]);

  return { data, loading, error, refresh, updateCache, clearCache, isFresh };
}
```

### Simplified WorkoutContext

```javascript
export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const cacheKey = user ? `workouts_${user.id}` : null;

  const {
    data: workouts,
    loading,
    error,
    refresh,
    updateCache,
    clearCache
  } = useApiCache(cacheKey, getWorkoutSummaries, { ttl: 2 * 60 * 1000 });

  // Optimistic delete
  const deleteWorkout = async (id) => {
    const prev = workouts;
    updateCache(list => list.filter(w => w.id !== id));
    try {
      await apiDeleteWorkout(id);
    } catch (err) {
      updateCache(prev); // rollback
      throw err;
    }
  };

  // ... rest is much simpler
}
```

## Option B: Use TanStack Query (Recommended)

Replace custom caching with battle-tested library:

```bash
npm install @tanstack/react-query
```

### Setup

```javascript
// index.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### useWorkouts Hook

```javascript
// hooks/useWorkouts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkoutSummaries, deleteWorkout as apiDelete } from '../api';

export function useWorkouts() {
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading, error } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkoutSummaries,
  });

  const deleteMutation = useMutation({
    mutationFn: apiDelete,
    onMutate: async (workoutId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workouts'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['workouts']);

      // Optimistically remove
      queryClient.setQueryData(['workouts'], old =>
        old.filter(w => w.id !== workoutId)
      );

      return { previous };
    },
    onError: (err, workoutId, context) => {
      // Rollback on error
      queryClient.setQueryData(['workouts'], context.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  return {
    workouts,
    loading: isLoading,
    error,
    deleteWorkout: deleteMutation.mutate,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  };
}
```

### useWorkoutDetail Hook

```javascript
export function useWorkoutDetail(workoutId) {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => getWorkoutDetail(workoutId),
    enabled: !!workoutId,
  });
}
```

## Benefits of TanStack Query

| Feature | Current Custom Code | TanStack Query |
|---------|--------------------|--------------------|
| Caching | ~50 lines | Built-in |
| TTL/Stale time | ~20 lines | Config option |
| Request deduplication | ~15 lines | Built-in |
| Optimistic updates | ~30 lines | `onMutate` hook |
| Background refetch | ~20 lines | Built-in |
| Retry on failure | Not implemented | Built-in |
| Devtools | None | React Query Devtools |

## Migration Steps (Option B)

1. Install TanStack Query
2. Add QueryClientProvider to index.js
3. Create `hooks/useWorkouts.js` with useQuery
4. Create `hooks/useWorkoutDetail.js`
5. Update components to use new hooks
6. Remove WorkoutContext (or keep as thin wrapper)
7. Add React Query Devtools for debugging:
   ```javascript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   // Add <ReactQueryDevtools /> in development
   ```

## Files Affected

- `src/index.js` - Add provider
- `src/contexts/WorkoutContext.jsx` - Replace or simplify
- `src/components/WorkoutListPage.jsx` - Update imports
- `src/hooks/useWorkoutLogger.js` - Update upsert logic
- Any component using `useWorkouts()`
