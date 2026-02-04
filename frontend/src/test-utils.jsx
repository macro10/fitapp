import { render } from '@testing-library/react';
import { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for each test to ensure isolation
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

// Create a mock AuthContext to avoid localStorage side effects in tests
const MockAuthContext = createContext(null);

export function MockAuthProvider({ children, user = null }) {
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }), [user]);

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Export the mock context for use in ExerciseContext tests
export { MockAuthContext };

// Hook to use mock auth in tests
export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
}

// Test providers wrapper with configurable user state
export function TestProviders({ children, user = 'test-token', queryClient }) {
  const client = queryClient || createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <MockAuthProvider user={user}>
        {children}
      </MockAuthProvider>
    </QueryClientProvider>
  );
}

// Export createTestQueryClient for tests that need direct access
export { createTestQueryClient };

// Custom render that wraps with test providers
export function renderWithProviders(ui, { user = 'test-token', queryClient, ...options } = {}) {
  function Wrapper({ children }) {
    return <TestProviders user={user} queryClient={queryClient}>{children}</TestProviders>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
