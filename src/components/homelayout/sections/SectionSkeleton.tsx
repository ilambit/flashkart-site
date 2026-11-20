"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CardSkeleton from "@/components/skeleton/CardSkeleton";
import {
  pickDeviceNumber,
  pickDeviceImage,
  toCssAspectRatio,
} from "@/utils/helperFunction";

// Section loading skeleton placeholders.
const SectionSkeletonBody = ({
  type,
  config,
  device,
}: {
  type?: string;
  config?: any;
  device?: string;
}) => {
  switch (type) {
    case "banner_slider": {
      const dev = device || "desktop";
      const aspectRaw =
        config?.image_aspect && typeof config.image_aspect === "object"
          ? pickDeviceImage(config.image_aspect, dev)
          : config?.image_aspect;
      // Same default the real section falls back to.
      const aspectRatio = toCssAspectRatio(aspectRaw) ?? "3 / 1";
      return (
        <Skeleton className="w-full rounded-md" style={{ aspectRatio }} />
      );
    }

    // Mirror the real grid: a hardcoded 3-up 16:9 placeholder was ~1000px
    // taller than a single wide strip, and that swap was the page's CLS.
    case "grid_banner": {
      const dev = device || "desktop";
      const columns = Math.max(
        1,
        pickDeviceNumber(config?.grid_columns, dev, 0) ||
          pickDeviceNumber(config?.columns, dev, 0) ||
          2,
      );
      const rows = Math.max(1, pickDeviceNumber(config?.grid_rows, dev, 1));
      const gap = pickDeviceNumber(config?.grid_gap, dev, 0);
      const aspectRaw =
        config?.image_aspect && typeof config.image_aspect === "object"
          ? pickDeviceImage(config.image_aspect, dev)
          : config?.image_aspect;
      const aspectRatio = toCssAspectRatio(aspectRaw) ?? "16 / 9";
      return (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {Array(columns * rows)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                key={index}
                className="w-full rounded-md"
                style={{ aspectRatio }}
              />
            ))}
        </div>
      );
    }

    case "title_image":
      return <Skeleton className="w-full aspect-[1200/300] rounded-md" />;

    case "text_section":
      return (
        <div className="py-2">
          <Skeleton width={220} height={24} className="mb-2" />
          <Skeleton width="70%" height={16} />
        </div>
      );

    case "category_section":
      return (
        <>
          <div className="flex items-center justify-between mb-4">
            <Skeleton width={150} height={24} />
            <Skeleton width={80} height={24} />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton circle width={72} height={72} className="mb-2" />
                  <Skeleton width={56} height={14} />
                </div>
              ))}
          </div>
        </>
      );

    case "brand_section":
      return (
        <>
          <div className="flex items-center justify-between mb-4">
            <Skeleton width={150} height={24} />
            <Skeleton width={80} height={24} />
          </div>
          <div className="flex gap-6 overflow-hidden pb-2">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="min-w-[120px] flex-shrink-0">
                  <Skeleton height={80} className="mb-2 rounded-md" />
                  <Skeleton width="80%" height={14} className="mx-auto" />
                </div>
              ))}
          </div>
        </>
      );

    case "product_slider":
    default:
      return (
        <>
          <div className="flex items-center justify-between mb-4">
            <Skeleton width={180} height={24} />
            <Skeleton width={100} height={24} />
          </div>
          <div className="flex gap-4 overflow-hidden pb-2">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="w-[150px] md:w-[200px] flex-shrink-0">
                  <CardSkeleton variant="product" />
                </div>
              ))}
          </div>
        </>
      );
  }
};

interface SectionSkeletonProps {
  type?: string;
  fullBleed?: boolean;
  className?: string;
  /** The real block's config, so the placeholder reserves its true height. */
  config?: any;
  device?: string;
  /** Rendered inside the section wrapper — skip its container and margins. */
  bare?: boolean;
}

const SectionSkeleton = ({
  type,
  fullBleed = false,
  className = "",
  config,
  device,
  bare = false,
}: SectionSkeletonProps) => (
  <div
    aria-busy="true"
    aria-hidden="true"
    className={`${
      bare ? "w-full" : `${fullBleed ? "w-full" : "container max-md:px-0"} my-6`
    } ${className}`.trim()}
  >
    <SectionSkeletonBody type={type} config={config} device={device} />
  </div>
);

export default SectionSkeleton;
