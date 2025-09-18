import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../../contexts/ExerciseContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { DumbbellIcon, ArrowLeft } from "lucide-react";

export default function ExerciseSelectorPage() {
  const navigate = useNavigate();
  const { exercises = [], loading, loadExercises } = useExercises();
  const [search, setSearch] = useState("");

  useEffect(() => { loadExercises().catch(() => {}); }, [loadExercises]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(e => e.name.toLowerCase().includes(q));
  }, [search, exercises]);

  const handleSelect = (exercise) => {
    navigate("/log", { state: { selectedExercise: exercise } });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/log")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Select Exercise</h1>
        </div>

        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg border">
          <DumbbellIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            className="border-none bg-transparent"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-lg border">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading exercises...</div>
          ) : (
            <Command>
              <CommandEmpty>No exercise found.</CommandEmpty>
              <CommandGroup className="max-h-[70vh] overflow-auto">
                {filtered.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise)}
                    className="cursor-pointer"
                  >
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          )}
        </div>
      </div>
    </div>
  );
}
