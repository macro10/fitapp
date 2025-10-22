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

export const getWorkoutSummaries = async () => {
  const response = await api.get(`${API_BASE}/api/workouts/?summary=1`)
  return response.data
}

export const getWorkoutDetail = async (workoutId) => {
  const response = await api.get(`${API_BASE}/api/workouts/${workoutId}/`)
  return response.data
}

export const createWorkout = async (date, name, total_volume) => {
  const response = await api.post(`${API_BASE}/api/workouts/`, { date, name, total_volume })
  return response.data
}

export const createCustomExercise = async ({ name, muscle_group }) => {
  const response = await api.post(`${API_BASE}/api/exercises/`, {
    name,
    muscle_group
  });
  return response.data;
};

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

export const createWorkoutWithExercises = async (date, performedExercises, name, total_volume) => {
  try {
    // First create the workout (include precomputed volume)
    const workout = await createWorkout(date, name, total_volume)
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

export const getWeeklyVolumeAnalytics = async (startDate, endDate, config = {}) => {
  const response = await api.get(
    `analytics/weekly-volume/?start_date=${startDate}&end_date=${endDate}`,
    config
  );
  return response.data;
};

export const getWeeklyFrequencyAnalytics = async (startDate, endDate, config = {}) => {
  const response = await api.get(
    `analytics/weekly-frequency/?start_date=${startDate}&end_date=${endDate}`,
    config
  );
  return response.data;
};

export const getTopWorkouts = async (limit = 5, config = {}) => {
  const response = await api.get(`analytics/top-workouts/?limit=${limit}`, config);
  return response.data;
};

export const getMuscleGroupsSummary = async (
  { weeks = 12, currentWindow = 2, threshold = 0.2 } = {},
  config = {}
) => {
  const params = new URLSearchParams({
    weeks: String(weeks),
    currentWindow: String(currentWindow),
    threshold: String(threshold),
  });
  const res = await api.get(`analytics/muscle-groups/summary/?${params.toString()}`, config);
  return res.data;
};