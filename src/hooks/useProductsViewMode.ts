"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type ProductsViewMode = number | "list";

const STORAGE_KEY = "productsViewMode";
const DEFAULT_VIEW_MODE: ProductsViewMode = 5;

// Restores before paint, so list view never flashes a grid of skeletons.
const useRestoreEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Shared by ProductsList and its route-level skeleton so both start in the
// same view mode.
const useProductsViewMode = (persist = false) => {
  const [viewMode, setViewMode] = useState<ProductsViewMode>(DEFAULT_VIEW_MODE);
  const restored = useRef(false);

  useRestoreEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage unavailable — keep the default.
    }
    restored.current = true;
    if (saved === "list") return setViewMode("list");
    const n = Number(saved);
    if ([2, 3, 4, 5].includes(n)) setViewMode(n);
  }, []);

  useEffect(() => {
    // Don't overwrite the saved value before it's restored.
    if (!persist || !restored.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(viewMode));
    } catch {
      // storage unavailable — view mode just won't persist.
    }
  }, [persist, viewMode]);

  return [viewMode, setViewMode] as const;
};

export default useProductsViewMode;
