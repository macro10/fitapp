import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises } from "../api";
import { useAuth } from "../App";
import api from "../apiClient";

export default function WorkoutLoggerPage() {
  const [exercises, setExercises] = useState([]);
  const [performed, setPerformed] = useState([]);
  const [selected, setSelected] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState("");
  const [weights, setWeights] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const addPerformed = () => {
    if (!selected) return;
    setPerformed([
      ...performed,
      {
        exercise: selected,
        sets,
        reps_per_set: reps.split(",").map(Number),
        weights_per_set: weights.split(",").map(Number),
      },
    ]);
    setSelected("");
    setSets(1);
    setReps("");
    setWeights("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(
      "/workouts/",
      {
        date: new Date().toISOString().split("T")[0],
        performed_exercises: performed,
      }
    );
    navigate("/");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Log New Workout</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="border p-1">
            <option value="">Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <input type="number" min={1} value={sets} onChange={e => setSets(Number(e.target.value))} className="border p-1 ml-2 w-16" placeholder="Sets" />
          <input type="text" value={reps} onChange={e => setReps(e.target.value)} className="border p-1 ml-2 w-32" placeholder="Reps (e.g. 10,8,6)" />
          <input type="text" value={weights} onChange={e => setWeights(e.target.value)} className="border p-1 ml-2 w-32" placeholder="Weights (e.g. 100,90,80)" />
          <button type="button" onClick={addPerformed} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">Add</button>
        </div>
        <div>
          {performed.map((p, i) => (
            <div key={i} className="text-sm">
              {exercises.find(ex => ex.id === Number(p.exercise))?.name || p.exercise} — Sets: {p.sets}, Reps: {p.reps_per_set.join(", ")}, Weights: {p.weights_per_set.join(", ")}
            </div>
          ))}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Workout</button>
        <button type="button" className="ml-2 text-gray-500 underline" onClick={() => navigate("/")}>Cancel</button>
      </form>
    </div>
  );
}