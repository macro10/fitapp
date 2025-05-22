import api from './apiClient'

const API_BASE = 'http://localhost:8000'

export const getExercises = async () => {
  const response = await api.get(`${API_BASE}/api/exercises/`)
  return response.data
}

export const getWorkouts = async () => {
  const response = await api.get(`${API_BASE}/api/performed-exercises/`)
  return response.data
}

export const createPerformedExercise = async (data) => {
  const response = await api.post(`${API_BASE}/api/performed-exercises/`, data)
  return response.data
}