import { DumbbellIcon } from "lucide-react";
import { useState, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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
  const inputRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    // Ensure input gets focus after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center justify-between p-4 rounded-lg border cursor-text hover:bg-accent/50 transition-colors"
          role="combobox"
          aria-expanded={open}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 flex-1" onClick={handleClick}>
            <DumbbellIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none outline-none w-full text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="Add exercise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setOpen(true)}
              onClick={handleClick}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandEmpty>No exercise found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {exercises
              .filter(exercise => 
                exercise.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={() => {
                    onSelect(exercise);
                    setSearch("");
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