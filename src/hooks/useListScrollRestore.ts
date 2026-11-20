"use client";
import { useEffect, useRef } from "react";

const PREFIX = "list-scroll:";
// Past this the cached pages are gone anyway, so the old offset lands nowhere.
const MAX_AGE_MS = 1000 * 60 * 30;
// The list paints before images settle; retry until the page is tall enough.
const MAX_RESTORE_FRAMES = 40;

const read = (key: string): number => {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return 0;
    const { y, ts } = JSON.parse(raw);
    if (!y || Date.now() - ts > MAX_AGE_MS) return 0;
    return Number(y) || 0;
  } catch {
    return 0;
  }
};

const write = (key: string, y: number) => {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ y, ts: Date.now() }));
  } catch {
    // private mode / quota — scrolling still works, it just won't be restored
  }
};

/**
 * Remembers where the user was in a long list and puts them back there when
 * they return (product → back → list), instead of dropping them at the top.
 * `key` must change with the filters, so a different list never reuses an offset.
 */
export default function useListScrollRestore(key: string, ready: boolean) {
  const restored = useRef(false);
  const latestY = useRef(0);

  // Track the offset continuously — a route change gives no reliable last event.
  useEffect(() => {
    const onScroll = () => {
      latestY.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Persist on the way out, including a tab close.
  useEffect(() => {
    if (!key) return;
    const save = () => write(key, latestY.current);
    window.addEventListener("pagehide", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
    };
  }, [key]);

  useEffect(() => {
    if (!key || !ready || restored.current) return;
    const target = read(key);
    if (target <= 0) {
      restored.current = true;
      return;
    }
    let frames = 0;
    let raf = 0;
    const step = () => {
      // Scrolling before the rows exist would clamp to the current bottom.
      const reachable =
        document.documentElement.scrollHeight - window.innerHeight >= target;
      if (reachable || frames++ >= MAX_RESTORE_FRAMES) {
        window.scrollTo({ top: target, behavior: "auto" });
        restored.current = true;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, ready]);
}
