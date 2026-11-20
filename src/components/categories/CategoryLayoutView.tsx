"use client";

import { useAppSelector } from "@/redux/hooks";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as api from "@/api/apiRoutes";
import SectionsRenderer from "@/components/homelayout/SectionsRenderer";
import Category from "./Category";
import Loader from "@/components/loader/Loader";
import dynamic from "next/dynamic";
import useFullCategoryTree from "@/hooks/useFullCategoryTree";
import useIsHydrated from "@/hooks/useIsHydrated";
import useDeviceBreakpoint from "@/hooks/useDeviceBreakpoint";
import useScrollThresholdFetch from "@/hooks/useScrollThresholdFetch";
import { pickDeviceImage } from "@/utils/helperFunction";
import { categoryLayoutKey } from "@/utils/queryKeys";
import { CATEGORY_LAYOUT_SECTION_LIMIT } from "@/constants/homeLayout";

const StoreClosed = dynamic(() => import("@/components/store-closed/StoreClosed"));

// Only a plain http(s) URL reaches the injected CSS
const safeUrl = (url?: string | null) =>
  /^https?:\/\/[^\s"'()\\]+$/i.test((url || "").trim())
    ? (url as string).trim()
    : null;

// Only plain hex reaches the injected CSS
const safeHex = (hex?: string | null) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test((hex || "").trim())
    ? (hex as string).trim()
    : null;

// Categories screen built in the panel's Category Builder. Same section
// objects as home, plus a header to paint the screen's top bar. Falls back to
// the plain category grid when the layout has nothing to show.
const CategoryLayoutView = ({ initialCategory = null }: { initialCategory?: any }) => {
  const city = useAppSelector((state) => state.City.city);
  const setting = useAppSelector((state) => state.Setting.setting);
  const language = useAppSelector((state) => state.Language.selectedLanguage);
  const shopMode = useAppSelector((state) => state.ShopMode.mode);
  const isHydrated = useIsHydrated();
  const device = useDeviceBreakpoint();

  const latitude = isHydrated
    ? city?.latitude || setting?.default_city?.latitude
    : undefined;
  const longitude = isHydrated
    ? city?.longitude || setting?.default_city?.longitude
    : undefined;

  const { resolveCategoryTree } = useFullCategoryTree({
    latitude,
    longitude,
    languageId: language?.id,
  });

  const {
    data,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: categoryLayoutKey({ latitude, longitude, shopMode, device }),
    queryFn: async ({ pageParam }) => {
      const response = await api.getCategoryLayout({
        latitude,
        longitude,
        limit: CATEGORY_LAYOUT_SECTION_LIMIT,
        offset: pageParam,
        device,
      });
      // Same "not deliverable" contract as home layout.
      if (response?.status === 0 && response?.message) {
        return { storeClosed: true, message: response.message };
      }
      return response?.data ?? null;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const nextOffset = (allPages ?? []).reduce(
        (sum, page) => sum + (page?.layout?.sections?.length ?? 0),
        0,
      );
      const total = lastPage?.total_sections;
      const lastCount = lastPage?.layout?.sections?.length ?? 0;
      const hasMore =
        typeof total === "number"
          ? nextOffset < total
          : lastCount >= CATEGORY_LAYOUT_SECTION_LIMIT;
      return hasMore ? nextOffset : undefined;
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  useScrollThresholdFetch({
    threshold: 0.7,
    enabled: !!hasNextPage && !isFetchingNextPage && !isFetching,
    onLoadMore: fetchNextPage,
  });

  const sections = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const page of data?.pages ?? []) {
      for (const section of page?.layout?.sections ?? []) {
        const key = String(section?.id ?? "");
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        out.push(section);
      }
    }
    return out;
  }, [data?.pages]);

  const header = data?.pages?.[0]?.layout?.header;
  const headerImage =
    header?.background_theme === "image"
      ? safeUrl(pickDeviceImage(header?.background_image_url, device))
      : null;

  if (!isHydrated || (isLoading && !data)) return <Loader screen="full" />;

  if ((data?.pages?.[0] as any)?.storeClosed) return <StoreClosed />;

  // No layout for this zone/channel, or the request failed — plain grid.
  if (isError || sections.length === 0) {
    return <Category initialCategory={initialCategory} />;
  }

  // The screen's top bar is the site header, on every width. Unlayered
  // <style> with an id selector beats the header's own utility classes.
  const headerBg = safeHex(header?.background_color);
  const headerText = safeHex(header?.text_color);
  const headerCss =
    headerImage || headerBg
      ? `header#site-header{${
          headerImage
            ? `--layout-header-gradient:url(${headerImage});--layout-header-gradient-continue:url(${headerImage});--layout-header-bg-size:cover;`
            : `--layout-header-bg:${headerBg};--layout-header-gradient:none;--layout-header-gradient-continue:none;`
        }${headerText ? `--layout-header-text:${headerText};` : ""}}`
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

export default CategoryLayoutView;
