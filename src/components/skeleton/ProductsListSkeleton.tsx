"use client";

import BreadCrumb from "@/components/breadcrumb/BreadCrumb";
import FilterSkeleton from "@/components/productFilter/FilterSkeleton";
import CardSkeleton from "./CardSkeleton";
import useProductsViewMode from "@/hooks/useProductsViewMode";

// Skeleton loader for products listing page
const ProductsListSkeleton = () => {
  // Same saved view mode ProductsList restores, so the grid doesn't flip once it mounts.
  const [viewMode] = useProductsViewMode();
  const isList = viewMode === "list";
  return (
  <section>
    <BreadCrumb />
    <div className="container">
      <div className="mb-5 md:mb-8 md:mt-2">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-[280px] shrink-0 self-start">
            <FilterSkeleton />
          </aside>
          <div className="flex flex-1 min-w-0 flex-col gap-6">
            <div className="mb-2 pt-3 md:pt-0">
              <CardSkeleton height={70} />
            </div>
            <div
              className={`grid gap-4 auto-rows-min ${
                isList
                  ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                  : "product-grid-cols grid-cols-2"
              }`}
              style={
                isList
                  ? undefined
                  : ({ "--grid-cols": viewMode } as React.CSSProperties)
              }
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <CardSkeleton key={i} variant={isList ? "list" : "product"} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default ProductsListSkeleton;
