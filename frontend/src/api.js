import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export const getExercises = async () => {
  const response = await axios.get(`${API_BASE}/api/exercises/`)
  return response.data
}

export const getWorkouts = async () => {
  const response = await axios.get(`${API_BASE}/api/performed-exercises/`)
  return response.data
}

export const createPerformedExercise = async (data) => {
  const response = await axios.post(`${API_BASE}/api/performed-exercises/`, data)
  return response.data
}