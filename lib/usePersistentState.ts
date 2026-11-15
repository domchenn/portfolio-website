"use client";

import { useCallback, useSyncExternalStore } from "react";

// A string value remembered for the current browser tab: it survives refreshes, but a new tab
// or a new visit starts fresh (sessionStorage is cleared when the tab closes).
// Falls back to in-memory state when storage is unavailable (private mode, blocked site data).
// Server render and first client render use `fallback`, so hydration always matches.

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function usePersistentState(key: string, fallback: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback
  );

  const setValue = useCallback(
    (next: string) => {
      memory.set(key, next);
      try {
        window.sessionStorage.setItem(key, next);
      } catch {
        // storage unavailable: memory copy still works for this page view
      }
      listeners.forEach((l) => l());
    },
    [key]
  );

  return [value, setValue];
}
