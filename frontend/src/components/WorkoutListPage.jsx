import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { getWorkouts } from "../api";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkouts();
        setWorkouts(data || []);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Workouts</h1>
        <div className="text-gray-600">Loading workouts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Workouts</h1>
        <div className="text-red-600">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Workouts</h1>
      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full w-16 h-16 text-3xl"
        onClick={() => navigate("/log")}
      >
        +
      </button>
      <button
        className="absolute top-4 right-4 text-sm text-red-500"
        onClick={() => { setUser(null); navigate("/auth"); }}
      >
        Logout
      </button>
      {workouts.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          No workouts yet. Click the + button to log your first workout!
        </div>
      ) : (
        <ul>
          {workouts.map((w) => (
            <li key={w.id} className="border rounded mb-2 p-2">
              <div
                className="cursor-pointer font-semibold"
                onClick={() => setExpanded(expanded === w.id ? null : w.id)}
              >
                {w.date} {expanded === w.id ? "▲" : "▼"}
              </div>
              {expanded === w.id && w.performed_exercises && (
                <ul className="ml-4 mt-2">
                  {w.performed_exercises.map((pe) => (
                    <li key={pe.id} className="text-sm">
                      <div>
                        <b>{pe.exercise?.name}</b> — Sets: {pe.sets}, 
                        Reps: {Array.isArray(pe.reps_per_set) ? pe.reps_per_set.join(", ") : "N/A"}, 
                        Weights: {Array.isArray(pe.weights_per_set) ? pe.weights_per_set.join(", ") : "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}