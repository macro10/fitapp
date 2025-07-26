import { Button } from "../ui/button";
import { Plus, DumbbellIcon } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

const ExerciseSelector = ({ exercises, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
          role="combobox"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <DumbbellIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Add exercise...
            </span>
          </div>
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput 
            placeholder="Search exercises..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No exercise found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {exercises.map((exercise) => (
              <CommandItem
                key={exercise.id}
                value={exercise.name}
                onSelect={() => {
                  onSelect(exercise);
                  setOpen(false);
                }}
              >
                {exercise.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { ExerciseSelector }