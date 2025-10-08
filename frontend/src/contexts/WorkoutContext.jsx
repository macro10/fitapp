import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getWorkoutSummaries as apiGetWorkoutSummaries, deleteWorkout as apiDeleteWorkout, getWorkoutDetail as apiGetWorkoutDetail } from "../api";
import { useAuth } from "./AuthContext";

const TTL_MS = 2 * 60 * 1000; // 2 minutes

const WorkoutContext = createContext(null);

function userCacheSuffix(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload.user_id != null
      ? `uid_${payload.user_id}`
      : payload.sub != null
      ? `sub_${payload.sub}`
      : payload.username
      ? `uname_${payload.username}`
      : `tok_${token.slice(-24)}`;
  } catch {
    return `tok_${(token || "").slice(-24)}`;
  }
}

function makeCacheKey(userToken) {
  const suffix = userToken ? userCacheSuffix(userToken) : "anon";
  return `WORKOUTS_CACHE_v2_${suffix}`; // bump to v2 to avoid stale collisions
}

const sortByDateDesc = (arr) => {
  return [...arr].sort((a, b) => new Date(b.date) - new Date(a.date));
};

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const cacheKey = makeCacheKey(user?.token);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchedRef = useRef(null);
  const inFlightRef = useRef(null);
  const pendingDeleteIds = useRef(new Set()); // barrier for optimistic deletes
  const detailInFlightRef = useRef(new Map()); // workoutId -> Promise

  const readCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.data && typeof parsed.ts === "number" ? parsed : null;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback((data) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }, [cacheKey]);

  // Debounced writes to avoid excessive localStorage churn during detail merges
  const debounceRef = useRef(null);
  const writeCacheDebounced = useCallback((data) => {
    try {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        writeCache(data);
      }, 250);
    } catch {}
  }, [writeCache]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
  }, [cacheKey]);

  const isFresh = useCallback((ts) => Date.now() - ts < TTL_MS, []);

  const applyPendingDeletes = useCallback((list) => {
    if (!pendingDeleteIds.current.size) return list;
    return list.filter(w => !pendingDeleteIds.current.has(w.id));
  }, []);

  const fetchWorkouts = useCallback(async () => {
    const data = await apiGetWorkoutSummaries();
    const list = sortByDateDesc(Array.isArray(data) ? data : []);
    const masked = applyPendingDeletes(list);

    // Preserve existing details (performed_exercises) for unchanged workouts
    setWorkouts(prev => {
      const prevById = new Map(prev.map(w => [w.id, w]));
      const merged = masked.map(w => {
        const prevW = prevById.get(w.id);
        return prevW && Array.isArray(prevW.performed_exercises)
          ? { ...w, performed_exercises: prevW.performed_exercises }
          : w;
      });
      lastFetchedRef.current = Date.now();
      writeCache(merged);
      return merged;
    });
  }, [applyPendingDeletes, writeCache]);

  const doFetch = useCallback(async (showLoading) => {
    if (inFlightRef.current) return inFlightRef.current;
    const p = (async () => {
      try {
        if (showLoading) setLoading(true);
        await fetchWorkouts();
      } finally {
        if (showLoading) setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = p;
    return p;
  }, [fetchWorkouts]);

  // Explicit load: no background revalidate when cache is fresh
  const loadWorkouts = useCallback(async ({ force = false } = {}) => {
    setError(null);

    if (!force) {
      const cached = readCache();
      if (cached?.data) {
        const sorted = sortByDateDesc(cached.data);
        const masked = applyPendingDeletes(sorted);
        setWorkouts(masked);
        lastFetchedRef.current = cached.ts;

        if (isFresh(cached.ts)) {
          // Explicit model: skip background refresh when fresh
          return;
        }
      }
    }
    await doFetch(true);
  }, [readCache, isFresh, doFetch, applyPendingDeletes]);

  // Delete with barrier + explicit post-success sync
  const deleteWorkout = useCallback(async (workoutId) => {
    const prev = workouts;
    pendingDeleteIds.current.add(workoutId);

    const next = prev.filter(w => w.id !== workoutId);
    setWorkouts(next);
    writeCache(next);

    try {
      await apiDeleteWorkout(workoutId);
      pendingDeleteIds.current.delete(workoutId);
      // Single foreground sync to confirm server state
      await doFetch(false);
    } catch (e) {
      // rollback
      pendingDeleteIds.current.delete(workoutId);
      setWorkouts(prev);
      writeCache(prev);
      throw e;
    }
  }, [workouts, writeCache, doFetch]);

  // Upsert newly-created workout (keeps sort) — unaffected by delete barrier
  const upsertWorkout = useCallback((workout) => {
    const merged = sortByDateDesc([workout, ...workouts.filter(w => w.id !== workout.id)]);
    setWorkouts(merged);
    writeCache(merged);
  }, [workouts, writeCache]);

  // Load a single workout's full detail and merge into state/cache (deduped)
  const loadWorkoutDetail = useCallback(async (workoutId) => {
    if (!workoutId) return;
    // If already have details, skip
    const existing = workouts.find(w => w.id === workoutId);
    if (existing && Array.isArray(existing.performed_exercises)) return;

    // Deduplicate in-flight requests
    if (detailInFlightRef.current.has(workoutId)) {
      return detailInFlightRef.current.get(workoutId);
    }

    const p = (async () => {
      try {
        const detail = await apiGetWorkoutDetail(workoutId);
        // Merge while preserving order, using functional updater to avoid races
        setWorkouts(prev => {
          const merged = prev.map(w => (w.id === workoutId ? { ...w, ...detail } : w));
          writeCacheDebounced(merged);
          return merged;
        });
      } finally {
        detailInFlightRef.current.delete(workoutId);
      }
    })();

    detailInFlightRef.current.set(workoutId, p);
    return p;
  }, [workouts, writeCacheDebounced]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setError(null);
      setLoading(false);
      lastFetchedRef.current = null;
      inFlightRef.current = null;
      pendingDeleteIds.current.clear();
      detailInFlightRef.current.clear();
      clearCache();
    }
  }, [user, clearCache]);

  // Prefetch once after login (explicit: may show spinner on first mount)
  useEffect(() => {
    if (user) {
      loadWorkouts().catch(() => {});
    }
  }, [user, loadWorkouts]);

  // Automatically prefetch details in background for workouts missing them (with limited concurrency)
  useEffect(() => {
    if (!workouts?.length) return;
    const ids = workouts.filter(w => w.performed_exercises === undefined).map(w => w.id);
    if (!ids.length) return;

    const MAX = 4; // tune per device/network
    let idx = 0, cancelled = false;

    async function run() {
      if (cancelled) return;
      const id = ids[idx++]; if (id == null) return;
      try { await loadWorkoutDetail(id); } finally { if (!cancelled) run(); }
    }
    for (let i = 0; i < Math.min(MAX, ids.length); i++) run();
    return () => { cancelled = true; };
  }, [workouts, loadWorkoutDetail]);

  // Add a one-time cleanup effect (remove any old v1 keys):
  useEffect(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("WORKOUTS_CACHE_v1_")) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }, []);

  // Cleanup any pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const value = useMemo(() => ({
    workouts,
    loading,
    error,
    lastFetched: lastFetchedRef.current,
    loadWorkouts,
    refresh: () => loadWorkouts({ force: true }),
    deleteWorkout,
    upsertWorkout,
    setWorkouts,
    loadWorkoutDetail,
  }), [workouts, loading, error, loadWorkouts, deleteWorkout, upsertWorkout, loadWorkoutDetail]);

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkouts must be used within WorkoutProvider");
  return ctx;
}