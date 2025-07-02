import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createWorkoutWithExercises } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { DumbbellIcon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

// Component for inputting reps and weights for a single set
function SetInputs({ setNumber, value, onChange }) {
  return (
    <Card className="mb-2">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Set {setNumber}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Reps</label>
            <Input
              type="number"
              min={1}
              value={value.reps || ''}
              onChange={(e) => onChange(setNumber - 1, 'reps', Number(e.target.value))}
              placeholder="Number of reps"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Weight (lbs)</label>
            <Input
              type="number"
              min={0}
              step={5}
              value={value.weight || ''}
              onChange={(e) => onChange(setNumber - 1, 'weight', Number(e.target.value))}
              placeholder="Weight in lbs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for a single exercise entry
function ExerciseEntry({ exercise, exercises, onRemove, onUpdate }) {
  const [sets, setSets] = useState(1);
  const [setDetails, setSetDetails] = useState([{ reps: '', weight: '' }]);
  const [uniformSets, setUniformSets] = useState(false);
  const [uniformValues, setUniformValues] = useState({ reps: '', weight: '' });

  const handleSetsChange = (newSets) => {
    const numSets = Number(newSets);
    setSets(numSets);
    
    // If uniform sets is enabled, fill all sets with the uniform values
    if (uniformSets) {
      const newDetails = Array(numSets).fill({ ...uniformValues });
      setSetDetails(newDetails);
      onUpdate({
        ...exercise,
        sets: numSets,
        reps_per_set: newDetails.map(s => s.reps),
        weights_per_set: newDetails.map(s => s.weight)
      });
    } else {
      setSetDetails(prev => {
        if (numSets > prev.length) {
          return [...prev, ...Array(numSets - prev.length).fill({ reps: '', weight: '' })];
        }
        return prev.slice(0, numSets);
      });
      onUpdate({
        ...exercise,
        sets: numSets,
        reps_per_set: setDetails.slice(0, numSets).map(s => s.reps),
        weights_per_set: setDetails.slice(0, numSets).map(s => s.weight)
      });
    }
  };

  const handleUniformValueChange = (field, value) => {
    const newUniformValues = { ...uniformValues, [field]: value };
    setUniformValues(newUniformValues);
    
    // Update all sets with the new uniform value
    const newDetails = Array(sets).fill({ ...newUniformValues });
    setSetDetails(newDetails);
    onUpdate({
      ...exercise,
      sets,
      reps_per_set: newDetails.map(s => s.reps),
      weights_per_set: newDetails.map(s => s.weight)
    });
  };

  const handleSetDetailChange = (setIndex, field, value) => {
    if (uniformSets) {
      handleUniformValueChange(field, value);
    } else {
      setSetDetails(prev => {
        const newDetails = [...prev];
        newDetails[setIndex] = { ...newDetails[setIndex], [field]: value };
        return newDetails;
      });
      onUpdate({
        ...exercise,
        sets,
        reps_per_set: setDetails.map(s => s.reps),
        weights_per_set: setDetails.map(s => s.weight)
      });
    }
  };

  const handleUniformToggle = (checked) => {
    setUniformSets(checked);
    if (checked) {
      // When enabling uniform sets, use the first set's values as the uniform values
      const firstSet = setDetails[0] || { reps: '', weight: '' };
      setUniformValues(firstSet);
      const newDetails = Array(sets).fill({ ...firstSet });
      setSetDetails(newDetails);
      onUpdate({
        ...exercise,
        sets,
        reps_per_set: newDetails.map(s => s.reps),
        weights_per_set: newDetails.map(s => s.weight)
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {exercises.find(ex => ex.id === Number(exercise.exercise))?.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Number of sets:</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={sets}
                onChange={(e) => handleSetsChange(e.target.value)}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Uniform sets:</label>
              <Switch
                checked={uniformSets}
                onCheckedChange={handleUniformToggle}
              />
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {uniformSets ? (
          <SetInputs
            setNumber={1}
            value={uniformValues}
            onChange={(_, field, value) => handleUniformValueChange(field, value)}
          />
        ) : (
          Array.from({ length: sets }, (_, i) => (
            <SetInputs
              key={i}
              setNumber={i + 1}
              value={setDetails[i]}
              onChange={handleSetDetailChange}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ExerciseSelector({ exercises, value, onValueChange }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between"
        >
          {value
            ? exercises.find((exercise) => exercise.id.toString() === value)?.name
            : "Select an exercise..."}
          <PlusIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search exercises..." />
          <CommandEmpty>No exercise found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {exercises.map((exercise) => (
              <CommandItem
                key={exercise.id}
                value={exercise.name}
                onSelect={() => {
                  onValueChange(exercise.id.toString());
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === exercise.id.toString() ? "opacity-100" : "opacity-0"
                  )}
                />
                {exercise.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function WorkoutLoggerPage() {
  const [exercises, setExercises] = useState([]);
  const [performed, setPerformed] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    setPerformed(prev => [...prev, {
      exercise: Number(selectedExercise),
      sets: 1,
      reps_per_set: [0],
      weights_per_set: [0]
    }]);
    setSelectedExercise("");
  };

  const handleRemoveExercise = (index) => {
    setPerformed(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index, updatedExercise) => {
    setPerformed(prev => {
      const newPerformed = [...prev];
      newPerformed[index] = updatedExercise;
      return newPerformed;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (performed.length === 0) {
      setError("Please add at least one exercise");
      return;
    }

    // Validate all exercises have complete data
    const isValid = performed.every(exercise => 
      exercise.reps_per_set.every(reps => reps > 0) &&
      exercise.weights_per_set.every(weight => weight >= 0)
    );

    if (!isValid) {
      setError("Please fill in all sets with valid numbers");
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
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DumbbellIcon className="h-6 w-6" />
              Log New Workout
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Exit"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <ExerciseSelector
              exercises={exercises}
              value={selectedExercise}
              onValueChange={setSelectedExercise}
            />
            <Button onClick={handleAddExercise} disabled={!selectedExercise}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {performed.map((exercise, index) => (
          <ExerciseEntry
            key={index}
            exercise={exercise}
            exercises={exercises}
            onRemove={() => handleRemoveExercise(index)}
            onUpdate={(updated) => handleUpdateExercise(index, updated)}
          />
        ))}

        <div className="flex gap-4">
          {performed.length > 0 && (
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Workout"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}