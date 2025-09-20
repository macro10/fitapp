// /Users/mchaletrotter/Repos/fitapp/frontend/src/components/workoutLogger/CustomExerciseModal.jsx
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

const GROUPS = ['chest','back','shoulders','arms','legs','core'];

export default function CustomExerciseModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState(null);

  const canSave = useMemo(() => name.trim().length >= 2 && !!group, [name, group]);

  if (!open) return null;

  const handleSave = () => {
    if (!canSave) return;
    const now = Date.now();
    onCreate?.({
      id: `custom-${now}`,
      name: name.trim(),
      muscle_group: group,
      isCustom: true,
      level: 'beginner',
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [],
      category: 'strength',
      images: [],
    });
    setName("");
    setGroup(null);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Add Custom Exercise</h2>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Exercise name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Romanian Deadlift"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Muscle group</label>
            <Select value={group ?? ""} onValueChange={(v) => setGroup(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {GROUPS.map(g => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="flex-1" disabled={!canSave} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}