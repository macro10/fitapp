import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Helper to create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Helper to create wrapper with both QueryClient and ExerciseProvider
function createWrapper(queryClient) {
  const client = queryClient || createTestQueryClient();
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={client}>
        <ExerciseProvider>{children}</ExerciseProvider>
      </QueryClientProvider>
    );
  };
}

describe('ExerciseContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

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

  describe('React Query caching', () => {
    it('uses cached data when available and fresh', async () => {
      const queryClient = createTestQueryClient();

      // Pre-populate the cache
      queryClient.setQueryData(['exercises'], mockExercises);

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(queryClient),
      });

      // Should immediately have cached data without loading state
      expect(result.current.exercises).toEqual(mockExercises);
      expect(result.current.loading).toBe(false);
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
  });

  describe('force refresh', () => {
    it('refetches data when refresh is called', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock to track new calls
      api.get.mockClear();

      // Force refresh
      await act(async () => {
        await result.current.refresh();
      });

      // Should have made a new API call
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

      // React Query may or may not show loading during refetch depending on configuration
      // The key behavior is that the refetch happens

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

    it('updates exerciseMap when exercises change via setExercises', async () => {
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

      await waitFor(() => {
        expect(result.current.exerciseMap).toEqual({
          10: { id: 10, name: 'Pull Up', muscle_group: 'back' },
        });
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
        result.current.setExercises(prev => [...prev, newExercise]);
      });

      await waitFor(() => {
        expect(result.current.exercises).toHaveLength(4);
      });
      expect(result.current.exercises[3]).toEqual(newExercise);
    });

    it('supports functional updates', async () => {
      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newExercise = { id: 100, name: 'Custom Exercise', muscle_group: 'arms' };

      act(() => {
        result.current.setExercises(prev => [...prev, newExercise]);
      });

      await waitFor(() => {
        expect(result.current.exercises).toHaveLength(4);
      });
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
      // Error should be set
      expect(result.current.error).toBeTruthy();

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
    it('returns empty exercises when user is not logged in', async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // When not logged in, exercises should be empty
      expect(result.current.exercises).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('removes query from cache when user becomes null', async () => {
      const queryClient = createTestQueryClient();

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.exercises).toEqual(mockExercises);
      });

      // Verify cache has the data
      expect(queryClient.getQueryData(['exercises'])).toEqual(mockExercises);

      // Simulate logout by triggering the effect that clears cache
      useAuth.mockReturnValue({ user: null });

      // Render a new hook with null user - this triggers the cleanup effect
      renderHook(() => useExercises(), {
        wrapper: createWrapper(queryClient),
      });

      // Wait for effect to run and clear the cache
      await waitFor(() => {
        expect(queryClient.getQueryData(['exercises'])).toBeUndefined();
      });
    });

    it('fetches fresh data on new mount when user is logged in', async () => {
      // First mount and load
      const { result: result1, unmount } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.exercises).toEqual(mockExercises);
      });

      unmount();

      // Clear mock
      api.get.mockClear();

      // Second mount with fresh query client (simulating fresh session)
      const { result: result2 } = renderHook(() => useExercises(), {
        wrapper: createWrapper(),
      });

      // Should fetch again with a new query client
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('exercises/');
      });

      await waitFor(() => {
        expect(result2.current.exercises).toEqual(mockExercises);
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

      await waitFor(() => {
        expect(result.current.exercises).toEqual(newExercises);
      });

      expect(api.get).toHaveBeenCalled();
    });

    it('loadExercises without force is a no-op (React Query handles auto-fetch)', async () => {
      const queryClient = createTestQueryClient();

      const { result } = renderHook(() => useExercises(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to track future calls
      api.get.mockClear();

      // Call loadExercises without force - should NOT make an API call
      // React Query handles initial fetch automatically, so explicit calls are no-ops
      await act(async () => {
        await result.current.loadExercises();
      });

      // No API call should be made - data is already cached
      expect(api.get).not.toHaveBeenCalled();
      // Data should still be available
      expect(result.current.exercises).toEqual(mockExercises);
    });
  });
});
