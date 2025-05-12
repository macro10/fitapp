import React, { useEffect, useState } from 'react';
import { getExercises, createPerformedExercise } from '../api';

function WorkoutLogger() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(['', '', '']);
  const [weightsPerSet, setWeightsPerSet] = useState(['', '', '']);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleRepsChange = (index, value) => {
    const newReps = [...repsPerSet];
    newReps[index] = value;
    setRepsPerSet(newReps);
  };

  const handleWeightsChange = (index, value) => {
    const newWeights = [...weightsPerSet];
    newWeights[index] = value;
    setWeightsPerSet(newWeights);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPerformedExercise({
      exercise: selectedExercise,
      sets,
      reps_per_set: repsPerSet.map(Number),
      weights_per_set: weightsPerSet.map(Number),
      // You may need to add workout ID or date depending on your backend
    });
    alert('Logged!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
        <option value="">Select exercise</option>
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>
      <input
        type="number"
        value={sets}
        min={1}
        onChange={e => {
          const val = Number(e.target.value);
          setSets(val);
          setRepsPerSet(Array(val).fill(''));
          setWeightsPerSet(Array(val).fill(''));
        }}
      />
      {Array.from({ length: sets }).map((_, i) => (
        <div key={i}>
          <input
            type="number"
            placeholder={`Reps for set ${i + 1}`}
            value={repsPerSet[i] || ''}
            onChange={e => handleRepsChange(i, e.target.value)}
          />
          <input
            type="number"
            placeholder={`Weight for set ${i + 1}`}
            value={weightsPerSet[i] || ''}
            onChange={e => handleWeightsChange(i, e.target.value)}
          />
        </div>
      ))}
      <button type="submit">Log Exercise</button>
    </form>
  );
}

export default WorkoutLogger;
