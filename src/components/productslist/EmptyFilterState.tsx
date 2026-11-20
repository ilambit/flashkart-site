"use client";
import { t } from "@/utils/translation";
import NotFound from "@/components/notfound/NotFound";
import NoOrderSvg from "@/assets/empty-state/no-product.svg";

interface EmptyFilterStateProps {
  /** True when any filter is active — otherwise "clear all" has nothing to do. */
  hasFilters?: boolean;
  onClearAll: () => void;
  className?: string;
}

/** "No products found", with "clear filters" as the way out of a filtered list. */
const EmptyFilterState = ({
  hasFilters = false,
  onClearAll,
  className = "",
}: EmptyFilterStateProps) => {
  if (!hasFilters) {
    return (
      <NotFound
        image={NoOrderSvg}
        title={t("no_products_found")}
        className={className}
      />
    );
  }

  return (
    <NotFound
      image={NoOrderSvg}
      title={t("no_products_found")}
      className={className}
    >
      <button
        type="button"
        onClick={onClearAll}
        className="mt-1 text-sm font-medium text-[#DB3D26] transition hover:underline"
      >
        {t("clear_filters")}
      </button>
    </NotFound>
  );
};

export default EmptyFilterState;
