import api from './apiClient'

const API_BASE = 'http://localhost:8000'

export const getExercises = async () => {
  const response = await api.get(`${API_BASE}/api/exercises/`)
  return response.data
}

export const getWorkouts = async () => {
  const response = await api.get(`${API_BASE}/api/workouts/`)
  return response.data
}

export const createWorkout = async (date) => {
  const response = await api.post(`${API_BASE}/api/workouts/`, { date })
  return response.data
}

export const createPerformedExercise = async (workoutId, data) => {
  console.log("Creating performed exercise with:", {
    workout: workoutId,
    exercise_id: data.exercise,
    sets: data.sets,
    reps_per_set: data.reps_per_set,
    weights_per_set: data.weights_per_set
  });
  const response = await api.post(`${API_BASE}/api/performed-exercises/`, {
    workout: workoutId,
    exercise_id: data.exercise,
    sets: data.sets,
    reps_per_set: data.reps_per_set,
    weights_per_set: data.weights_per_set
  })
  return response.data
}

export const createWorkoutWithExercises = async (date, performedExercises) => {
  try {
    // First create the workout
    const workout = await createWorkout(date)
    console.log("Created workout:", workout)
    
    // Then create all performed exercises for this workout
    const createdExercises = await Promise.all(
      performedExercises.map(exercise => 
        createPerformedExercise(workout.id, exercise)
      )
    )
    
    return {
      ...workout,
      performed_exercises: createdExercises
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    throw error
  }
}