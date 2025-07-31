import { DumbbellIcon, Plus, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

export const ExerciseSelector = ({ exercises, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full flex items-center p-4 rounded-lg
                 backdrop-blur-sm bg-white/40 
                 border border-blue-100 
                 hover:bg-white/60 hover:shadow-md
                 transition-all duration-300
                 cursor-text"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-md bg-blue-50">
            <DumbbellIcon className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            placeholder="Add exercise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-600 w-full"
            onFocus={() => setOpen(true)}
          />
        </div>
        <span className="text-blue-500 text-2xl">+</span>
      </div>

      {open && (
        <>
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-blue-100 bg-white/90 backdrop-blur-xl shadow-lg max-h-[300px] overflow-auto z-50">
            {filteredExercises.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No exercises found
              </div>
            ) : (
              <div className="py-2">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      onSelect(exercise);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50/50 transition-colors"
                  >
                    {exercise.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};