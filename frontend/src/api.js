import api from './apiClient'

const API_BASE = process.env.REACT_APP_API_URL

export const getExercises = async () => {
  const response = await api.get(`${API_BASE}/api/exercises/`)
  return response.data
}

export const getWorkouts = async () => {
  const response = await api.get(`${API_BASE}/api/workouts/`)
  return response.data
}

export const createWorkout = async (date, name) => {
  const response = await api.post(`${API_BASE}/api/workouts/`, { date, name })
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

export const createWorkoutWithExercises = async (date, performedExercises, name) => {
  try {
    // First create the workout
    const workout = await createWorkout(date, name)
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

export const deleteWorkout = async (workoutId) => {
  const response = await api.delete(`${API_BASE}/api/workouts/${workoutId}/`);
  return response.data;
};

export const updateWorkout = async (workoutId, data) => {
  const response = await api.patch(`${API_BASE}/api/workouts/${workoutId}/`, data);
  return response.data;
};