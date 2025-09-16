import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getWorkouts as apiGetWorkouts, deleteWorkout as apiDeleteWorkout } from "../api";
import { useAuth } from "./AuthContext";

const TTL_MS = 2 * 60 * 1000; // 2 minutes

const WorkoutContext = createContext(null);

function makeCacheKey(user) {
  const suffix = user ? (typeof user === "string" ? user.slice(0, 16) : "authed") : "anon";
  return `WORKOUTS_CACHE_v1_${suffix}`;
}

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const cacheKey = makeCacheKey(user);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchedRef = useRef(null);
  const inFlightRef = useRef(null);

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

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
  }, [cacheKey]);

  const isFresh = useCallback((ts) => Date.now() - ts < TTL_MS, []);

  const fetchWorkouts = useCallback(async () => {
    const data = await apiGetWorkouts();
    const list = Array.isArray(data) ? data : [];
    setWorkouts(list);
    lastFetchedRef.current = Date.now();
    writeCache(list);
  }, [writeCache]);

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

  // Public API: load with cache + background revalidation (deduped)
  const loadWorkouts = useCallback(async ({ force = false } = {}) => {
    setError(null);

    if (!force) {
      const cached = readCache();
      if (cached?.data) {
        setWorkouts(cached.data);
        lastFetchedRef.current = cached.ts;

        if (isFresh(cached.ts)) {
          // background refresh without loading state, deduped
          void doFetch(false);
          return;
        }
      }
    }

    // stale or no cache: foreground fetch, deduped
    await doFetch(true);
  }, [readCache, isFresh, doFetch]);

  // Public API: delete with optimistic update (updates cache)
  const deleteWorkout = useCallback(async (workoutId) => {
    const prev = workouts;
    const next = prev.filter(w => w.id !== workoutId);
    setWorkouts(next);
    writeCache(next);
    try {
      await apiDeleteWorkout(workoutId);
    } catch (e) {
      setWorkouts(prev);
      writeCache(prev);
      throw e;
    }
  }, [workouts, writeCache]);

  // Clear state on logout
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setError(null);
      setLoading(false);
      lastFetchedRef.current = null;
      inFlightRef.current = null;
      clearCache();
    }
  }, [user, clearCache]);

  const value = useMemo(() => ({
    workouts,
    loading,
    error,
    lastFetched: lastFetchedRef.current,
    loadWorkouts,
    refresh: () => loadWorkouts({ force: true }),
    deleteWorkout,
    setWorkouts,
  }), [workouts, loading, error, loadWorkouts, deleteWorkout]);

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