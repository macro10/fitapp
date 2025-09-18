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
  const [activeGroups, setActiveGroups] = useState(() => new Set());

  useEffect(() => { loadExercises().catch(() => {}); }, [loadExercises]);

  const GROUP_ORDER = ['chest','back','shoulders','arms','legs','core'];
  const groups = useMemo(() => {
    const s = new Set();
    (exercises || []).forEach(e => e.muscle_group && s.add(e.muscle_group));
    const ordered = GROUP_ORDER.filter(g => s.has(g));
    for (const g of s) if (!GROUP_ORDER.includes(g)) ordered.push(g);
    return ordered;
  }, [exercises]);

  const toggleGroup = (g) => {
    setActiveGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (exercises || []).filter(e => {
      const matchesText = !q || e.name.toLowerCase().includes(q);
      const matchesGroup = activeGroups.size === 0 || activeGroups.has(e.muscle_group);
      return matchesText && matchesGroup;
    });
  }, [search, exercises, activeGroups]);

  const handleSelect = (exercise) => {
    navigate("/log", { state: { selectedExercise: exercise } });
  };

  const label = (g) => g ? g.charAt(0).toUpperCase() + g.slice(1) : "";

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Centered header with back button */}
        <div className="relative flex items-center justify-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/log")} className="absolute left-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Select Exercise</h1>
        </div>

        {/* Muscle group filter bar with divider */}
        <div className="border-b pb-3 mb-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {groups.map(g => {
              const active = activeGroups.has(g);
              return (
                <Button
                  key={g}
                  size="default"
                  variant={active ? "default" : "outline"}
                  className="rounded-xl px-3 h-9"
                  onClick={() => toggleGroup(g)}
                >
                  {label(g)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search */}
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

        {/* Results */}
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