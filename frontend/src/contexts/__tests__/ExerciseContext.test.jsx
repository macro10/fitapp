import { renderHook, act, waitFor } from '@testing-library/react';
import { ExerciseProvider, useExercises } from '../ExerciseContext';
import api from '../../apiClient';

// Mock the apiClient module
jest.mock('../../apiClient');

// Mock the AuthContext module
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../AuthContext';

// Sample exercise data for tests
const mockExercises = [
  { id: 1, name: 'Bench Press', muscle_group: 'chest' },
  { id: 2, name: 'Squat', muscle_group: 'legs' },
  { id: 3, name: 'Deadlift', muscle_group: 'back' },
];

const CACHE_KEY = 'EXERCISES_CACHE_v1';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to create wrapper with ExerciseProvider
function createWrapper() {
  return function Wrapper({ children }) {
    return <ExerciseProvider>{children}</ExerciseProvider>;
  };
}

describe('ExerciseContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Clear localStorage
    localStorage.clear();

    // Default: user is logged in
    useAuth.mockReturnValue({ user: 'test-token' });

    // Default: API returns mock exercises
    api.get.mockResolvedValue({ data: mockExercises });
  });

  describe('initial load', () => {
    it('fetches exercises on mount when user is logged in', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.get).toHaveBeenCalledWith('exercises/');
      expect(result.current.exercises).toEqual(mockExercises);
    });

    it('does not fetch exercises when user is not logged in', async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Wait a tick to ensure no async operations happen
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(api.get).not.toHaveBeenCalled();
      expect(result.current.exercises).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('throws error when useExercises is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useExercises());
      }).toThrow('useExercises must be used within ExerciseProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('caching', () => {
    it('uses cached data when cache is fresh (< 10 minutes)', async () => {
      // Set up fresh cache
      const freshTimestamp = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: freshTimestamp,
        data: mockExercises,
      }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Should immediately have cached data without loading state
      expect(result.current.exercises).toEqual(mockExercises);
      expect(result.current.loading).toBe(false);

      // Should still make a background request to revalidate
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('exercises/');
      });
    });

    it('shows loading state when cache is stale (> 10 minutes)', async () => {
      // Set up stale cache
      const staleTimestamp = Date.now() - (15 * 60 * 1000); // 15 minutes ago
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: staleTimestamp,
        data: mockExercises,
      }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Should use cached data immediately
      expect(result.current.exercises).toEqual(mockExercises);

      // But loading should be true since cache is stale
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('shows loading state when no cache exists', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.exercises).toEqual(mockExercises);
    });

    it('writes to cache after successful fetch', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      expect(cached.data).toEqual(mockExercises);
      expect(cached.ts).toBeDefined();
      expect(Date.now() - cached.ts).toBeLessThan(1000); // Written recently
    });

    it('handles corrupted cache gracefully', async () => {
      // Set up corrupted cache
      localStorage.setItem(CACHE_KEY, 'not valid json');

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Should start loading since cache is invalid
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.exercises).toEqual(mockExercises);
    });

    it('handles cache with missing data field gracefully', async () => {
      // Set up cache with wrong structure
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now() }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.exercises).toEqual(mockExercises);
    });
  });

  describe('request deduplication', () => {
    it('deduplicates concurrent requests', async () => {
      // Slow down the API response to allow concurrent calls
      let resolveApi;
      api.get.mockImplementation(() => new Promise(resolve => {
        resolveApi = () => resolve({ data: mockExercises });
      }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Trigger multiple refreshes while first is in flight
      await act(async () => {
        result.current.refresh();
        result.current.refresh();
        result.current.refresh();
      });

      // Resolve the API call
      await act(async () => {
        resolveApi();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have made one API call (from initial mount)
      // The refresh calls should be deduplicated
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('force refresh', () => {
    it('bypasses cache when force=true', async () => {
      // Set up fresh cache
      const freshTimestamp = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      const cachedExercises = [{ id: 99, name: 'Cached', muscle_group: 'chest' }];
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: freshTimestamp,
        data: cachedExercises,
      }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Wait for initial load (uses cache)
      await waitFor(() => {
        expect(api.get).toHaveBeenCalled();
      });

      // Clear mock to track new calls
      api.get.mockClear();

      // Force refresh
      await act(async () => {
        await result.current.refresh();
      });

      // Should have made a new API call despite fresh cache
      expect(api.get).toHaveBeenCalledWith('exercises/');
      expect(result.current.exercises).toEqual(mockExercises);
    });

    it('shows loading state during force refresh', async () => {
      let resolveApi;
      api.get.mockImplementation(() => new Promise(resolve => {
        resolveApi = () => resolve({ data: mockExercises });
      }));

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);

      // Resolve first call
      await act(async () => {
        resolveApi();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start force refresh
      act(() => {
        result.current.refresh();
      });

      expect(result.current.loading).toBe(true);

      // Resolve refresh
      await act(async () => {
        resolveApi();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('exerciseMap', () => {
    it('computes exerciseMap from exercises array', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.exerciseMap).toEqual({
        1: { id: 1, name: 'Bench Press', muscle_group: 'chest' },
        2: { id: 2, name: 'Squat', muscle_group: 'legs' },
        3: { id: 3, name: 'Deadlift', muscle_group: 'back' },
      });
    });

    it('returns empty object when no exercises', async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      expect(result.current.exerciseMap).toEqual({});
    });

    it('updates exerciseMap when exercises change', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newExercises = [
        { id: 10, name: 'Pull Up', muscle_group: 'back' },
      ];

      act(() => {
        result.current.setExercises(newExercises);
      });

      expect(result.current.exerciseMap).toEqual({
        10: { id: 10, name: 'Pull Up', muscle_group: 'back' },
      });
    });
  });

  describe('setExercises (optimistic updates)', () => {
    it('allows direct state updates for optimistic UI', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newExercise = { id: 100, name: 'Custom Exercise', muscle_group: 'arms' };

      act(() => {
        result.current.setExercises([...result.current.exercises, newExercise]);
      });

      expect(result.current.exercises).toHaveLength(4);
      expect(result.current.exercises[3]).toEqual(newExercise);
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValue(error);

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Exercises should be empty after error
      expect(result.current.exercises).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('handles non-array response data', async () => {
      api.get.mockResolvedValue({ data: { exercises: mockExercises } });

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should handle non-array gracefully
      expect(result.current.exercises).toEqual([]);
    });
  });

  describe('logout cleanup', () => {
    it('clears exercises when user logs out', async () => {
      const { result, rerender } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.exercises).toEqual(mockExercises);
      });

      // Simulate logout by changing user to null
      useAuth.mockReturnValue({ user: null });
      rerender();

      expect(result.current.exercises).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('clears cache when user logs out', async () => {
      const { rerender } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(localStorage.getItem(CACHE_KEY)).not.toBe(null);
      });

      // Simulate logout
      useAuth.mockReturnValue({ user: null });
      rerender();

      expect(localStorage.getItem(CACHE_KEY)).toBe(null);
    });

    it('fetches fresh data when user logs back in', async () => {
      const { result, rerender } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.exercises).toEqual(mockExercises);
      });

      // Logout
      useAuth.mockReturnValue({ user: null });
      rerender();

      expect(result.current.exercises).toEqual([]);
      api.get.mockClear();

      // Login again
      useAuth.mockReturnValue({ user: 'new-token' });
      rerender();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('exercises/');
      });
    });
  });

  describe('loadExercises function', () => {
    it('exposes loadExercises for manual reloading', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      api.get.mockClear();

      // Update mock to return different data
      const newExercises = [{ id: 5, name: 'New Exercise', muscle_group: 'core' }];
      api.get.mockResolvedValue({ data: newExercises });

      await act(async () => {
        await result.current.loadExercises({ force: true });
      });

      expect(api.get).toHaveBeenCalled();
      expect(result.current.exercises).toEqual(newExercises);
    });
  });
});
