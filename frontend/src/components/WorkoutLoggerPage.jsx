import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createWorkoutWithExercises } from "../api";
import { useAuth } from "../App";

export default function WorkoutLoggerPage() {
  const [exercises, setExercises] = useState([]);
  const [performed, setPerformed] = useState([]);
  const [selected, setSelected] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState("");
  const [weights, setWeights] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const validateExercise = () => {
    if (!selected) {
      setError("Please select an exercise");
      return false;
    }
    if (!reps.trim()) {
      setError("Please enter reps");
      return false;
    }
    if (!weights.trim()) {
      setError("Please enter weights");
      return false;
    }
    const repsArray = reps.split(",").map(Number);
    const weightsArray = weights.split(",").map(Number);
    
    if (repsArray.length !== sets) {
      setError(`Please enter exactly ${sets} rep values`);
      return false;
    }
    if (weightsArray.length !== sets) {
      setError(`Please enter exactly ${sets} weight values`);
      return false;
    }
    if (repsArray.some(isNaN) || weightsArray.some(isNaN)) {
      setError("Please enter valid numbers for reps and weights");
      return false;
    }
    return true;
  };

  const addPerformed = () => {
    setError(null);
    if (!validateExercise()) return;

    setPerformed([
      ...performed,
      {
        exercise: Number(selected),
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
    setError(null);
    
    if (performed.length === 0) {
      setError("Please add at least one exercise");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkoutWithExercises(
        new Date().toISOString().split("T")[0],
        performed
      );
      navigate("/");
    } catch (err) {
      setError("Failed to save workout. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Log New Workout</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <select 
            value={selected} 
            onChange={e => setSelected(e.target.value)} 
            className="border p-2 w-full rounded"
          >
            <option value="">Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input 
              type="number" 
              min={1} 
              value={sets} 
              onChange={e => setSets(Number(e.target.value))} 
              className="border p-2 rounded flex-1" 
              placeholder="Number of sets" 
            />
            <input 
              type="text" 
              value={reps} 
              onChange={e => setReps(e.target.value)} 
              className="border p-2 rounded flex-1" 
              placeholder="Reps per set (e.g. 10,8,6)" 
            />
            <input 
              type="text" 
              value={weights} 
              onChange={e => setWeights(e.target.value)} 
              className="border p-2 rounded flex-1" 
              placeholder="Weights per set (e.g. 100,90,80)" 
            />
          </div>
          <button 
            type="button" 
            onClick={addPerformed} 
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Exercise
          </button>
        </div>

        {performed.length > 0 && (
          <div className="border rounded p-4 space-y-2">
            <h3 className="font-semibold">Added Exercises:</h3>
            {performed.map((p, i) => (
              <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium">
                  {exercises.find(ex => ex.id === Number(p.exercise))?.name}
                </div>
                <div className="text-gray-600">
                  {p.sets} sets: {p.reps_per_set.map((reps, idx) => (
                    <span key={idx}>
                      {reps} reps @ {p.weights_per_set[idx]}lbs
                      {idx < p.sets - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Saving..." : "Save Workout"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/")} 
            className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}