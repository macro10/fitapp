import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../../contexts/ExerciseContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import CustomExerciseModal from "./CustomExerciseModal";
import { createCustomExercise } from "../../api";
import useExerciseRecency from "../../hooks/useExerciseRecency";

import { Search, ArrowLeft, Pencil } from "lucide-react";

export default function ExerciseSelectorPage() {
  const navigate = useNavigate();
  const { exercises = [], loading, loadExercises, setExercises } = useExercises();

const [search, setSearch] = useState("");
const [activeGroups, setActiveGroups] = useState(() => new Set());
const [visibleCount, setVisibleCount] = useState(25);
const [customOpen, setCustomOpen] = useState(false);

  // measure bars to pad/size the scroll area
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const [topH, setTopH] = useState(0);
  const [bottomH, setBottomH] = useState(0);

  useEffect(() => { loadExercises().catch(() => {}); }, [loadExercises]);

  useEffect(() => {
    const measure = () => {
      setTopH(topRef.current ? topRef.current.offsetHeight : 0);
      setBottomH(bottomRef.current ? bottomRef.current.offsetHeight : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setTopH(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset pagination when filters/search change
  useEffect(() => {
    setVisibleCount(25);
  }, [search, activeGroups]);

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

  const { lastCompletedMap } = useExerciseRecency();
  const orderedFiltered = useMemo(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    return [...filtered].sort((a, b) => {
      const at = lastCompletedMap[a.id] || 0;
      const bt = lastCompletedMap[b.id] || 0;
      if (bt !== at) return bt - at; // most recent first
      return collator.compare(a.name, b.name);
    });
  }, [filtered, lastCompletedMap]);

  const visible = orderedFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < orderedFiltered.length;

  const onScrollLoadMore = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
    if (nearBottom && hasMore) setVisibleCount(c => Math.min(c + 25, orderedFiltered.length));
  };

  const handleSelect = (exercise) => {
    navigate("/log", { state: { selectedExercise: exercise } });
  };

  const label = (g) => g ? g.charAt(0).toUpperCase() + g.slice(1) : "";

  return (
    <div className="min-h-screen">
      {/* Top navbar (fixed) */}
      <div
        ref={topRef}
        className="fixed top-0 left-0 right-0 z-20 bg-background pt-[env(safe-area-inset-top,0px)] border-b"
      >
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <div className="relative flex items-center justify-center mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute left-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Select Exercise</h1>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {groups.map(g => {
              const active = activeGroups.has(g);
              return (
                <Button
                  key={g}
                  size="default"
                  variant={active ? "default" : "outline"}
                  className="rounded-xl px-2 h-8"
                  onClick={() => toggleGroup(g)}
                >
                  {label(g)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable content (search + list) */}
      <div
        className="container mx-auto max-w-2xl px-4"
        style={{ paddingTop: topH, paddingBottom: bottomH }}
      >
        <div
          className="overflow-y-auto"
          style={{ height: `calc(100dvh - ${topH}px - ${bottomH}px)` }}
          onScroll={onScrollLoadMore}
        >
          {/* Search */}
          <div className="mt-6 flex items-center gap-2 p-4 mb-4 rounded-lg border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              className="border-none bg-transparent"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Results */}
          <div>
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading exercises...</div>
            ) : (
              <Command>
                <CommandEmpty>No exercise found.</CommandEmpty>
                <CommandGroup className="space-y-3">
                  {visible.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      value={exercise.name}
                      onSelect={() => handleSelect(exercise)}
                      className="cursor-pointer rounded-xl border p-3 mb-1 text-md font-medium hover:bg-accent/50 focus:bg-accent/50"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>{exercise.name}</span>
                        {exercise.is_custom && (
                          <Pencil className="h-4 w-4 text-muted-foreground opacity-70" aria-label="Custom exercise" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {hasMore && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    Scrolling will load more…
                  </div>
                )}
              </Command>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navbar (fixed, moves with iOS keyboard) */}
      <div
        ref={bottomRef}
        className="fixed left-0 right-0 bottom-0 z-20 bg-background pb-[env(safe-area-inset-bottom,0px)] border-t"
      >
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <Button
            className="w-full h-12 rounded-full shadow-lg"
            onClick={() => setCustomOpen(true)}
          >
            <Pencil className="h-5 w-5 mr-2" />
            Custom Add
          </Button>
        </div>

        <CustomExerciseModal
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          initialName={search.trim()}
          onCreate={async (newExerciseDraft) => {
            try {
              const saved = await createCustomExercise({
                name: newExerciseDraft.name || newExerciseDraft?.name,
                muscle_group: newExerciseDraft.muscle_group || newExerciseDraft?.muscle_group,
              });
              setExercises(prev => [saved, ...prev]);
            } finally {
              setCustomOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}