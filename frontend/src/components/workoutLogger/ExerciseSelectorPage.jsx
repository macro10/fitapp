import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExerciseContext } from '../../contexts/ExerciseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { DumbbellIcon, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ExerciseSelectorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { exercises, loading } = useExerciseContext();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If not authenticated, show nothing while redirecting
  if (!user) {
    return null;
  }

  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSelect = (exercise) => {
    navigate('/log', { 
      state: { selectedExercise: exercise }
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/log')}
          >
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
            <div className="p-4 text-center text-muted-foreground">
              Loading exercises...
            </div>
          ) : (
            <Command>
              <CommandEmpty>No exercise found.</CommandEmpty>
              <CommandGroup className="max-h-[70vh] overflow-auto">
                {filteredExercises.map((exercise) => (
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
