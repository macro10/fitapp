import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import api from "../apiClient";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      const res = await api.get("/workouts/");
      setWorkouts(res.data);
    };
    fetchWorkouts();
  }, [user]);

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
      <ul>
        {workouts.map((w) => (
          <li key={w.id} className="border rounded mb-2 p-2">
            <div
              className="cursor-pointer font-semibold"
              onClick={() => setExpanded(expanded === w.id ? null : w.id)}
            >
              {w.date} {expanded === w.id ? "▲" : "▼"}
            </div>
            {expanded === w.id && (
              <ul className="ml-4 mt-2">
                {w.performed_exercises.map((pe) => (
                  <li key={pe.id} className="text-sm">
                    <div>
                      <b>{pe.exercise.name}</b> — Sets: {pe.sets}, Reps: {pe.reps_per_set.join(", ")}, Weights: {pe.weights_per_set?.join(", ") || "N/A"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}