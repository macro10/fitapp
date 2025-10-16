// /Users/mchaletrotter/Repos/fitapp/frontend/src/components/workoutLogger/CustomExerciseModal.jsx
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

const GROUPS = ["chest", "back", "shoulders", "arms", "legs", "core"];

export default function CustomExerciseModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState(null);

  const canSave = useMemo(() => name.trim().length >= 2 && !!group, [name, group]);

  if (!open) return null;

  const handleClose = () => {
    setName("");
    setGroup(null);
    onClose?.();
  };

  const handleSave = () => {
    if (!canSave) return;
    const now = Date.now();
    onCreate?.({
      id: `custom-${now}`,
      name: name.trim(),
      muscle_group: group,
      isCustom: true,
      level: "beginner",
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [],
      category: "strength",
      images: [],
    });
    handleClose();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={onKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[92vw] max-w-lg rounded-2xl border border-border/60 bg-background/80 shadow-2xl ring-1 ring-white/10 supports-[backdrop-filter]:bg-background/60
                   transition-all duration-200 ease-out translate-y-0 opacity-100"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
        >
          ×
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="p-5 md:p-6"
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Add Custom Exercise</h2>
            <p className="text-sm text-muted-foreground mt-1">Create an exercise tailored to your routine.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Exercise name</label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Romanian Deadlift"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Muscle group</label>
              <Select value={group ?? ""} onValueChange={(v) => setGroup(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!canSave}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}