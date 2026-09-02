"use client";

import { useSyncExternalStore } from "react";

/**
 * Browser-only reads belong in an external store rather than an effect that
 * calls setState — that pattern triggers a cascading render and React 19 flags
 * it. Each hook below exposes a subscribe/getSnapshot pair instead.
 */

const noopSubscribe = () => () => {};

/** False during SSR and the first paint, true once hydrated. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * The current time, quantised to the minute so the snapshot stays stable
 * between ticks. Returns 0 on the server.
 */
export function useNow() {
  return useSyncExternalStore(
    (onChange) => {
      const timer = setInterval(onChange, 60_000);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0,
  );
}

/** A localStorage key, kept in sync across tabs and manual writes. */
export function useLocalStorage(key: string) {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("local-storage", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("local-storage", onChange);
      };
    },
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

/** Writes a key and notifies every useLocalStorage subscriber in this tab. */
export function writeLocalStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing can reject writes; the in-memory choice still applies.
  }
  window.dispatchEvent(new Event("local-storage"));
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}
