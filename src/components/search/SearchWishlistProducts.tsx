"use client";

import { useAppSelector } from "@/redux/hooks";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/api/apiRoutes";
import { t } from "@/utils/translation";
import SearchProductRow from "@/components/search/SearchProductRow";
import { adaptProduct } from "@/components/search/SearchMindProducts";

const LIMIT = 15;

// Logged-in user's wishlist as a single horizontally scrolling row.
const SearchWishlistProducts = ({ enabled }: { enabled: boolean }) => {
  const jwtToken = useAppSelector((s) => s.User?.jwtToken);
  const latitude = useAppSelector((s) => s.City?.city?.latitude);
  const longitude = useAppSelector((s) => s.City?.city?.longitude);
  const favCount = useAppSelector((s) => s.Favorite?.favouriteProductIds?.length || 0);

  const { data = [], isLoading } = useQuery({
    queryKey: ["search-wishlist-products", jwtToken, latitude, longitude, favCount],
    queryFn: async () => {
      const res = await api.getFavorite({ latitude, longitude, limit: LIMIT, offset: 0 });
      return res?.status == 1 && Array.isArray(res?.data) ? res.data : [];
    },
    enabled: enabled && !!jwtToken && latitude != null && longitude != null,
    staleTime: 1000 * 60 * 5,
  });

  const products = useMemo(() => data.map(adaptProduct), [data]);

  if (!jwtToken || (!isLoading && products.length === 0)) return null;

  return (
    <SearchProductRow
      title={t("your_wishlist") || "Your wishlist"}
      products={products}
      isLoading={isLoading}
    />
  );
};

export default SearchWishlistProducts;
