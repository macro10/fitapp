// Mock for apiClient.js - used in tests to control API responses

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default mockApi;
