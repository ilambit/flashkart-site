"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { t } from "@/utils/translation";
import HomeVerticleProductCard from "@/components/productcards/HomeVerticleProductCard";

const ITEM_WIDTH = "w-[40%] shrink-0 min-[420px]:w-[31%] sm:w-[23%] md:w-[30%] lg:w-[22%] xl:w-[18%] 2xl:w-[15.5%]";
const ARROW_CLS =
  "absolute top-[40%] z-30 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-zinc-700 shadow-md transition hover:scale-105 md:flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

const SkeletonCard = () => (
  <div className={`${ITEM_WIDTH} flex flex-col gap-2 rounded-xl border border-gray-100 p-2 dark:border-zinc-800`}>
    <div className="aspect-square w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
  </div>
);

interface SearchProductRowProps {
  title: ReactNode;
  products: any[];
  isLoading: boolean;
  animate?: boolean;
}

// Titled single-row product rail for the search panel: swipe on mobile, arrows on desktop.
const SearchProductRow = ({ title, products, isLoading, animate = false }: SearchProductRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const left = Math.abs(el.scrollLeft);
    setCanPrev(left > 2);
    setCanNext(left + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [products.length, isLoading, updateArrows]);

  // Mouse drag scrolls the row like the Similar Products swiper; touch keeps native swipe
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let startX = 0;
    let startLeft = 0;
    let pointerId: number | null = null;
    let dragged = false;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let samples: { x: number; t: number }[] = [];

    const stopMotion = () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
    };
    const restoreSnap = () => {
      el.style.scrollSnapType = "";
    };
    // Glide onto the nearest card, then hand back to CSS snap
    const settle = () => {
      const rtl = getComputedStyle(el).direction === "rtl";
      const pad = parseFloat(getComputedStyle(el).scrollPaddingInlineStart) || 0;
      const box = el.getBoundingClientRect();
      let best = 0;
      let bestDist = Infinity;
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const r = child.getBoundingClientRect();
        const delta = rtl ? r.right - (box.right - pad) : r.left - (box.left + pad);
        if (Math.abs(delta) < bestDist) {
          bestDist = Math.abs(delta);
          best = delta;
        }
      }
      el.scrollTo({ left: el.scrollLeft + best, behavior: reduceMotion ? "auto" : "smooth" });
      settleTimer = setTimeout(restoreSnap, reduceMotion ? 0 : 400);
    };
    // Inertia: keep the release speed and let friction slow it down
    const glide = (velocity: number) => {
      let v = velocity;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(now - last, 32);
        last = now;
        const before = el.scrollLeft;
        el.scrollLeft = before + v * dt;
        v *= Math.pow(0.95, dt / 16);
        const stuck = Math.abs(el.scrollLeft - before) < 0.5 && Math.abs(v * dt) >= 0.5;
        if (Math.abs(v) < 0.05 || stuck) return settle();
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopMotion();
      pointerId = e.pointerId;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      dragged = false;
      samples = [{ x: el.scrollLeft, t: e.timeStamp }];
    };
    const onMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (!dragged) {
        if (Math.abs(dx) < 5) return;
        dragged = true;
        el.setPointerCapture(e.pointerId);
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      el.scrollLeft = startLeft - dx;
      samples.push({ x: el.scrollLeft, t: e.timeStamp });
      if (samples.length > 6) samples.shift();
    };
    const onUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      el.style.cursor = "";
      if (!dragged) return restoreSnap();
      // Speed over the last ~100ms of the drag, in px per ms
      const recent = samples.filter((p) => e.timeStamp - p.t < 100);
      const first = recent[0];
      const lastSample = recent[recent.length - 1];
      const span = first && lastSample ? lastSample.t - first.t : 0;
      const velocity = span > 0 ? (lastSample.x - first.x) / span : 0;
      if (!reduceMotion && Math.abs(velocity) > 0.2) glide(Math.max(-4, Math.min(4, velocity)));
      else settle();
    };
    // A drag must not open the card it ends on
    const onClick = (e: MouseEvent) => {
      if (!dragged) return;
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      stopMotion();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [isLoading]);

  const scrollByPage = (sign: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const dir = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: sign * dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-[#f4f6fb] p-2 pt-3 dark:bg-zinc-950 sm:p-3">
      <h3 className="mb-2.5 px-1.5 text-start text-sm font-bold text-zinc-900 dark:text-zinc-100 sm:mb-3 sm:px-0 sm:text-base">
        {title}
      </h3>
      <div className="relative">
        {canPrev && (
          <button type="button" onClick={() => scrollByPage(-1)} aria-label={t("previous") || "Previous"} className={`${ARROW_CLS} -start-1`}>
            <IoChevronBack size={16} className="rtl:rotate-180" />
          </button>
        )}
        {canNext && (
          <button type="button" onClick={() => scrollByPage(1)} aria-label={t("next") || "Next"} className={`${ARROW_CLS} -end-1`}>
            <IoChevronForward size={16} className="rtl:rotate-180" />
          </button>
        )}
        <div
          ref={rowRef}
          onScroll={updateArrows}
          className="no-scrollbar -mx-2 flex cursor-grab select-none snap-x snap-mandatory scroll-px-2 gap-1.5 overflow-x-auto overscroll-x-contain px-2 pb-1 sm:-mx-3 sm:scroll-px-3 sm:gap-2.5 sm:px-3"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product: any, i: number) => (
                <div
                  key={product.id}
                  className={`${ITEM_WIDTH} snap-start ${animate ? "fadeUpIn" : ""}`}
                  style={animate ? ({ "--i": i } as React.CSSProperties) : undefined}
                >
                  <HomeVerticleProductCard product={product} classicMobile />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default SearchProductRow;
