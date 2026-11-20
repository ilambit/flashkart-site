"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as api from "@/api/apiRoutes";
import SectionsRenderer from "@/components/homelayout/SectionsRenderer";
import Custom404 from "@/components/notfound/Custom404";
import Loader from "@/components/loader/Loader";
import useFullCategoryTree from "@/hooks/useFullCategoryTree";
import useIsHydrated from "@/hooks/useIsHydrated";
import useScrollThresholdFetch from "@/hooks/useScrollThresholdFetch";
import { pageBuilderKey } from "@/utils/queryKeys";
import { PAGE_BUILDER_SECTION_LIMIT } from "@/constants/homeLayout";

// Only plain hex reaches the injected CSS
const safeHex = (hex?: string | null) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test((hex || "").trim())
    ? (hex as string).trim()
    : null;

// Readable text color when the page sets no title_color
const contrastText = (hex?: string | null) => {
  const safe = safeHex(hex);
  const m = safe && /^#([0-9a-f]{6}|[0-9a-f]{3})/i.exec(safe);
  if (!m) return null;
  const h =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c: string) => c + c)
          .join("")
      : m[1];
  const n = Number.parseInt(h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
};

// Server-seeded initial page data for hydration
interface PageBuilderViewProps {
  slug: string;
  initialPage?: any;
}

const PageBuilderView = ({ slug, initialPage = null }: PageBuilderViewProps) => {
  const city = useAppSelector((state) => state.City.city);
  const setting = useAppSelector((state) => state.Setting.setting);
  const language = useAppSelector((state) => state.Language.selectedLanguage);
  const isHydrated = useIsHydrated();

  const latitude = !isHydrated
    ? initialPage?.latitude
    : city?.latitude || setting?.default_city?.latitude || initialPage?.latitude;
  const longitude = !isHydrated
    ? initialPage?.longitude
    : city?.longitude || setting?.default_city?.longitude || initialPage?.longitude;

  const { resolveCategoryTree } = useFullCategoryTree({
    latitude,
    longitude,
    languageId: language?.id,
  });

  // Device type based on window width
  const [device, setDevice] = useState(initialPage?.device || "web");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      let next = "web";
      if (w < 768) next = "app";
      else if (w < 1024) next = "tablet";
      setDevice(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Paginated section query seed
  const seed = initialPage?.data
    ? { pages: [initialPage.data], pageParams: [0] }
    : undefined;

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: pageBuilderKey({ slug, latitude, longitude }),
    queryFn: async ({ pageParam }) => {
      const response = await api.getPageBuilder({
        slug,
        latitude,
        longitude,
        limit: PAGE_BUILDER_SECTION_LIMIT,
        offset: pageParam,
      });
      return response?.data ?? null;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const nextOffset = (allPages ?? []).reduce(
        (sum, p) => sum + (p?.page?.sections?.length ?? 0),
        0,
      );
      const total = lastPage?.total_sections;
      const lastCount = lastPage?.page?.sections?.length ?? 0;
      const hasMore =
        typeof total === "number"
          ? nextOffset < total
          : lastCount >= PAGE_BUILDER_SECTION_LIMIT;
      return hasMore ? nextOffset : undefined;
    },
    enabled: !!slug && !!latitude && !!longitude,
    // Keep previous pages as placeholder during coordinate updates
    placeholderData: (prev: any) =>
      Array.isArray(prev?.pages) && Array.isArray(prev?.pageParams)
        ? prev
        : seed,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  useScrollThresholdFetch({
    threshold: 0.7,
    enabled: !!hasNextPage && !isFetchingNextPage && !isFetching,
    onLoadMore: fetchNextPage,
  });

  // Deduplicate sections by ID
  const sections = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const p of data?.pages ?? []) {
      for (const s of p?.page?.sections ?? []) {
        const key = String(s?.id ?? "");
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        out.push(s);
      }
    }
    return out;
  }, [data?.pages]);

  // Full screen loader while initial page data fetches
  if (isLoading && !data) return <Loader screen="full" />;

  const page = data?.pages?.[0]?.page;

  if (!isLoading && (!page || sections.length === 0)) {
    return <Custom404 />;
  }

  // Mobile-only header recolor from the page's own theme. Unlayered <style>
  // with an id selector beats the header's arbitrary-value utility classes.
  const headerColor = safeHex(page?.header_color);
  const titleColor = safeHex(page?.title_color) || contrastText(headerColor);
  const headerCss = headerColor
    ? `@media (max-width:767px){header#site-header{--layout-header-bg:${headerColor};--layout-header-gradient:none;--layout-header-gradient-continue:none;${
        titleColor ? `--layout-header-text:${titleColor};` : ""
      }}}`
    : null;

  return (
    <div>
      {headerCss && <style dangerouslySetInnerHTML={{ __html: headerCss }} />}
      <SectionsRenderer
        sections={sections}
        device={device}
        resolveCategoryTree={resolveCategoryTree}
      />
    </div>
  );
};

export default PageBuilderView;
