# Skill: React Query Context Refactor

Refactor a React Context that handles API fetching and caching to use React Query instead. This is a test-driven refactoring pattern.

## When to Use

Use this skill when refactoring a context that:
- Fetches data from an API
- Implements manual caching (localStorage, refs, etc.)
- Has request deduplication logic
- Provides loading/error states

## Prerequisites

Ensure React Query is installed and QueryClientProvider is set up:
- `@tanstack/react-query` in package.json
- QueryClientProvider wrapping App in `src/index.js`
- QueryClientProvider in test wrapper (`src/test-utils.jsx`)

## Test-Driven Refactoring Steps

### Step 1: Analyze Current State

1. Read the existing context file to understand:
   - What API endpoint(s) it fetches
   - What state it exposes (data, loading, error, etc.)
   - What functions it exposes (load, refresh, setData, etc.)
   - How caching/TTL is implemented

2. Identify all consumers by searching for the context hook usage:
   ```bash
   grep -r "useContextName" src/
   ```

3. Read existing tests to understand expected behavior

### Step 2: Update Tests First

1. Add QueryClientProvider to the test wrapper if not already present:
   ```javascript
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

   function createTestQueryClient() {
     return new QueryClient({
       defaultOptions: { queries: { retry: false, gcTime: 0 } },
     });
   }

   function createWrapper(queryClient) {
     const client = queryClient || createTestQueryClient();
     return function Wrapper({ children }) {
       return (
         <QueryClientProvider client={client}>
           <YourProvider>{children}</YourProvider>
         </QueryClientProvider>
       );
     };
   }
   ```

2. Update tests to reflect React Query behavior:
   - Remove localStorage-specific cache tests (React Query uses memory cache)
   - Keep behavior tests (loading states, data mapping, cleanup on logout)
   - Update "loadData without force" tests - these become no-ops with React Query
   - Add test for pre-populated QueryClient cache

3. Run tests - they should fail (we haven't implemented yet)

### Step 3: Create the React Query Hook

Create `src/hooks/use{Resource}Query.js`:

```javascript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../apiClient';

export const RESOURCE_QUERY_KEY = ['resourceName'];

async function fetchResource() {
  const res = await api.get('endpoint/');
  return Array.isArray(res.data) ? res.data : [];
}

export function useResourceQuery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: RESOURCE_QUERY_KEY,
    queryFn: fetchResource,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Match previous TTL
  });

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: RESOURCE_QUERY_KEY });
    }
  }, [user, queryClient]);

  // Derived data (e.g., maps, computed values)
  const itemMap = useMemo(() => {
    const map = {};
    for (const item of items) map[item.id] = item;
    return map;
  }, [items]);

  // Optimistic updates via setQueryData
  const setItems = useCallback((updater) => {
    queryClient.setQueryData(RESOURCE_QUERY_KEY, (prev = []) =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  }, [queryClient]);

  // Load function - no-op without force (React Query auto-fetches)
  const loadItems = useCallback(async ({ force = false } = {}) => {
    if (force) {
      await queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
      return refetch();
    }
    return Promise.resolve({ data: items });
  }, [queryClient, refetch, items]);

  const refresh = useCallback(() => loadItems({ force: true }), [loadItems]);

  return {
    items,
    itemMap,
    loading: isLoading,
    error,
    loadItems,
    refresh,
    setItems,
  };
}
```

### Step 4: Simplify the Context

Replace the context with a thin wrapper:

```javascript
import { createContext, useContext } from 'react';
import { useResourceQuery } from '../hooks/useResourceQuery';

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const state = useResourceQuery();
  return (
    <ResourceContext.Provider value={state}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResource() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResource must be used within ResourceProvider');
  return ctx;
}
```

### Step 5: Run Tests and Verify

1. Run the context tests:
   ```bash
   npm test -- --testPathPattern="ContextName" --watchAll=false
   ```

2. All tests should pass

3. Manual verification:
   - Start the app and login
   - Navigate through flows that use this context
   - Check Network tab - should see single request, no duplicates
   - Verify data loads correctly
   - Test logout/login cycle

## API Surface Preservation Checklist

Ensure the refactored context exposes the same interface:

| Property | Description |
|----------|-------------|
| `data` | The fetched data array |
| `dataMap` | Derived lookup object (if applicable) |
| `loading` | Boolean loading state |
| `error` | Error object or null |
| `loadData()` | No-op (React Query auto-fetches) |
| `loadData({ force: true })` | Invalidate and refetch |
| `refresh()` | Alias for force reload |
| `setData()` | Optimistic updates via setQueryData |

## Key Differences from Manual Caching

1. **No localStorage** - React Query uses in-memory cache
2. **Auto-fetch on mount** - No need for explicit `loadData()` calls in useEffects
3. **Built-in deduplication** - Concurrent requests are automatically deduplicated
4. **`loadData()` without force is a no-op** - Prevents duplicate requests from legacy consumer code
