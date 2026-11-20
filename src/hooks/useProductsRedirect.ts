"use client";

import { useAppDispatch } from "@/redux/hooks";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useZoneHref from "@/hooks/useZoneHref";
import {
  clearAllFilter,
  setBlockSource,
} from "@/redux/slices/productFilterSlice";
import { resolveIdCsvToSlugCsv } from "@/utils/categorySlugResolver";
import {
  buildProductsRedirectQuery,
  sanitizeRedirectParams,
} from "@/utils/urlProductFilters";

type ResolveCategoryTree = (() => Promise<any[]>) | undefined;

// `redirect_type: "products"` — opens the listing with the banner's filter set
// as its initial state. Shared by every section that renders a redirect block.
export default function useProductsRedirect(
  resolveCategoryTree?: ResolveCategoryTree,
) {
  const router = useRouter();
  const zoneHref = useZoneHref();
  const dispatch = useAppDispatch();

  return useCallback(
    async (node: any) => {
      const params = sanitizeRedirectParams(node?.redirect_params);
      // category_id arrives as an id; the listing URL carries slugs.
      let categorySlug = "";
      if (params.category_id) {
        const tree = (await resolveCategoryTree?.().catch(() => [])) || [];
        const slugCsv = resolveIdCsvToSlugCsv(tree, params.category_id);
        const partial =
          !!slugCsv &&
          slugCsv.split(",").length < params.category_id.split(",").length;
        // Some ids unknown to the tree: keep URL category-less so the raw CSV goes out
        categorySlug =
          partial && params.data_source === "category"
            ? ""
            : slugCsv || params.category_id;
      }
      // Drop any category/block scope the previous listing left in redux.
      dispatch(clearAllFilter({}));
      // data_source travels with the ids: the API reads category_id as a whole
      // subtree with it, which is what a parent-category banner needs when the
      // ids never resolved to slugs here.
      if (params.data_source) {
        dispatch(
          setBlockSource({
            data_source: params.data_source,
            source_id:
              params.data_source === "brand"
                ? params.brand_ids || ""
                : params.category_id || "",
          }),
        );
      }
      const qs = new URLSearchParams(
        buildProductsRedirectQuery(node?.redirect_params, {
          categorySlug,
          title: node?.redirect_title || "",
        }),
      ).toString();
      const dest = zoneHref("/products");
      router.push(qs ? `${dest}?${qs}` : dest);
    },
    [dispatch, resolveCategoryTree, router, zoneHref],
  );
}
