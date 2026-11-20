"use client";
import { useAppSelector } from "@/redux/hooks";
import React, { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import ImagePlaceholder from "../../assets/image-placeholder/image.png";
import useIsHydrated from "@/hooks/useIsHydrated";

interface ImageWithPlaceholderProps {
  src?: string | StaticImageData | null;
  alt?: string;
  className?: string;
  handleOnClick?: React.MouseEventHandler<HTMLImageElement>;
  priority?: boolean;
  /** "low" keeps decorative art from preempting the page's LCP image. */
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  quality?: number;
  width?: number;
  height?: number;
  fill?: boolean;
  /** Overrides next/image's lazy default; ignored when `priority` is set. */
  loading?: "eager" | "lazy";
  /** Fires once the real image has decoded. */
  onReady?: () => void;
}

const ImageWithPlaceholder = ({
  src,
  alt,
  className,
  handleOnClick,
  priority,
  fetchPriority,
  sizes,
  quality,
  width,
  height,
  loading,
  onReady,
}: ImageWithPlaceholderProps) => {
  const setting = useAppSelector((state) => state.Setting);
  const [isLoading, setIsLoading] = useState(!src);
  const [isError, setIsError] = useState(false);
  // Use fallback placeholder until hydrated
  const isHydrated = useIsHydrated();
  const placeholderSrc =
    (isHydrated && setting?.setting?.web_settings?.placeholder_image) ||
    ImagePlaceholder;

  return (
    <Image
      src={!src || isLoading || isError ? placeholderSrc : src}
      alt={alt || ""}
      {...(width && height
        ? { width, height }
        : {fill: true, sizes: sizes || "100vw" })}
      quality={quality}
      priority={priority}
      {...(priority ? {} : { loading })}
      fetchPriority={fetchPriority}
      className={className}
      onClick={handleOnClick}
      onLoad={() => {
        setIsLoading(false);
        onReady?.();
      }}
      onError={() => {
        setIsLoading(false);
        setIsError(true);
      }}
    />
  );
};

export default ImageWithPlaceholder;
