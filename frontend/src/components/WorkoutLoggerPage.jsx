import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createWorkoutWithExercises } from "../api";

// Subcomponent: Add Exercise Form
function AddExerciseForm({
  exercises,
  selected,
  sets,
  reps,
  weights,
  onChange,
  onAdd,
  error,
}) {
  return (
    <div className="space-y-2">
      <select
        value={selected}
        onChange={e => onChange("selected", e.target.value)}
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
          onChange={e => onChange("sets", Number(e.target.value))}
          className="border p-2 rounded flex-1"
          placeholder="Number of sets"
        />
        <input
          type="text"
          value={reps}
          onChange={e => onChange("reps", e.target.value)}
          className="border p-2 rounded flex-1"
          placeholder="Reps per set (e.g. 10,8,6)"
        />
        <input
          type="text"
          value={weights}
          onChange={e => onChange("weights", e.target.value)}
          className="border p-2 rounded flex-1"
          placeholder="Weights per set (e.g. 100,90,80)"
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Exercise
      </button>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Added Exercises List
function AddedExercisesList({ performed, exercises }) {
  if (performed.length === 0) return null;
  return (
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
  );
}

export default function WorkoutLoggerPage() {
  const [exercises, setExercises] = useState([]);
  const [performed, setPerformed] = useState([]);
  const [form, setForm] = useState({
    selected: "",
    sets: 1,
    reps: "",
    weights: "",
  });
  const [formError, setFormError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Validate the add exercise form
  const validateExercise = () => {
    if (!form.selected) {
      setFormError("Please select an exercise");
      return false;
    }
    if (!form.reps.trim()) {
      setFormError("Please enter reps");
      return false;
    }
    if (!form.weights.trim()) {
      setFormError("Please enter weights");
      return false;
    }
    const repsArray = form.reps.split(",").map(Number);
    const weightsArray = form.weights.split(",").map(Number);

    if (repsArray.length !== form.sets) {
      setFormError(`Please enter exactly ${form.sets} rep values`);
      return false;
    }
    if (weightsArray.length !== form.sets) {
      setFormError(`Please enter exactly ${form.sets} weight values`);
      return false;
    }
    if (repsArray.some(isNaN) || weightsArray.some(isNaN)) {
      setFormError("Please enter valid numbers for reps and weights");
      return false;
    }
    return true;
  };

  // Add a performed exercise to the list
  const addPerformed = () => {
    if (!validateExercise()) return;
    setPerformed([
      ...performed,
      {
        exercise: Number(form.selected),
        sets: form.sets,
        reps_per_set: form.reps.split(",").map(Number),
        weights_per_set: form.weights.split(",").map(Number),
      },
    ]);
    setForm({ selected: "", sets: 1, reps: "", weights: "" });
    setFormError(null);
  };

  // Handle workout submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (performed.length === 0) {
      setSubmitError("Please add at least one exercise");
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
      setSubmitError("Failed to save workout. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Log New Workout</h2>
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AddExerciseForm
          exercises={exercises}
          selected={form.selected}
          sets={form.sets}
          reps={form.reps}
          weights={form.weights}
          onChange={handleFormChange}
          onAdd={addPerformed}
          error={formError}
        />
        <AddedExercisesList performed={performed} exercises={exercises} />
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