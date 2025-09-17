import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../apiClient";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const ExerciseContext = createContext(null);
const CACHE_KEY = "EXERCISES_CACHE_v1";

export function ExerciseProvider({ children }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(null);
  const lastFetchedRef = useRef(null);

  const readCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.data ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }, []);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  }, []);

  const isFresh = useCallback((ts) => Date.now() - ts < TTL_MS, []);

  const fetchExercises = useCallback(async () => {
    const res = await api.get("exercises/");
    const list = Array.isArray(res.data) ? res.data : [];
    setExercises(list);
    lastFetchedRef.current = Date.now();
    writeCache(list);
  }, [writeCache]);

  const doFetch = useCallback(async (showLoading) => {
    if (inFlightRef.current) return inFlightRef.current;
    const p = (async () => {
      try {
        if (showLoading) setLoading(true);
        await fetchExercises();
      } finally {
        if (showLoading) setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = p;
    return p;
  }, [fetchExercises]);

  const loadExercises = useCallback(async ({ force = false } = {}) => {
    setError(null);

    if (!force) {
      const cached = readCache();
      if (cached?.data) {
        setExercises(cached.data);
        lastFetchedRef.current = cached.ts;

        if (isFresh(cached.ts)) {
          void doFetch(false);
          return;
        }
      }
    }

    await doFetch(true);
  }, [readCache, isFresh, doFetch]);

  useEffect(() => {
    if (!user) {
      setExercises([]);
      setError(null);
      setLoading(false);
      lastFetchedRef.current = null;
      inFlightRef.current = null;
      clearCache();
    }
  }, [user, clearCache]);

  // Prefetch once after login (hydrate from cache, background revalidate)
  useEffect(() => {
    if (user) {
      loadExercises().catch(() => {});
    }
  }, [user, loadExercises]);

  const exerciseMap = useMemo(() => {
    const map = {};
    for (const ex of exercises) map[ex.id] = ex;
    return map;
  }, [exercises]);

  const value = useMemo(() => ({
    exercises,
    exerciseMap,
    loading,
    error,
    lastFetched: lastFetchedRef.current,
    loadExercises,
    refresh: () => loadExercises({ force: true }),
    setExercises,
  }), [exercises, exerciseMap, loading, error, loadExercises]);

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercises() {
  const ctx = useContext(ExerciseContext);
  if (!ctx) throw new Error("useExercises must be used within ExerciseProvider");
  return ctx;
}