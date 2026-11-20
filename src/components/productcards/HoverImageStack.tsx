"use client";
import { useCallback, useState } from "react";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";

interface HoverImageStackProps {
  images: string[];
  /** Index the parent's hover timer is currently showing. */
  activeIdx: number;
  /** True while the pointer is over the card. */
  hovered?: boolean;
  alt: string;
  /** Classes for every frame (padding, grayscale, object-fit). */
  imgClassName?: string;
  /** Preload the first frame — only for the few cards above the fold. */
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}

// Desktop hover slideshow. Frames are absolutely stacked, so every one of them
// intersects the viewport and loads eagerly if rendered — mounting the whole
// gallery up front cost one request per image on every card on the page.
//
// So an untouched card mounts one frame, and the rest mount the moment the
// pointer arrives: hovering is the intent to see them, and that gives the
// images the ~900ms before the first slide to arrive. A frame that still is
// not decoded is never shown — the previous one stays up instead of a blank
// box flashing through.
const HoverImageStack = ({
  images,
  activeIdx,
  hovered = false,
  alt,
  imgClassName = "",
  priority = false,
  width = 300,
  height = 300,
  sizes,
}: HoverImageStackProps) => {
  // Once hovered, keep the gallery mounted: unmounting on pointer-out would
  // re-download every frame on the next hover.
  const [wasHovered, setWasHovered] = useState(false);
  if (hovered && !wasHovered) setWasHovered(true);
  const mountAll = wasHovered || activeIdx > 0;
  const mounted = mountAll ? images : images.slice(0, 1);

  const [loaded, setLoaded] = useState<number[]>([]);
  const markLoaded = useCallback((idx: number) => {
    setLoaded((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  }, []);

  // Hold the last decoded frame until the requested one is ready.
  const [shown, setShown] = useState(0);
  if (loaded.includes(activeIdx) && shown !== activeIdx) setShown(activeIdx);

  return (
    <>
      {mounted.map((img, idx) => (
        <ImageWithPlaceholder
          key={`${img}-${idx}`}
          src={img}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority && idx === 0}
          // In-viewport and hidden behind the active frame: fetch now, so the
          // slideshow has it decoded before it is due on screen.
          loading={idx === 0 ? undefined : "eager"}
          onReady={() => markLoaded(idx)}
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            idx === shown ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      ))}
    </>
  );
};

export default HoverImageStack;
