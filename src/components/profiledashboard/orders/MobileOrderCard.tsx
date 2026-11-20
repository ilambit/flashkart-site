import Link from "next/link";
import { LuRotateCcw, LuStore, LuX } from "react-icons/lu";
import { TbCurrentLocation } from "react-icons/tb";
import { t } from "@/utils/translation";
import { formatCustomDate } from "@/lib/utils";
import useZoneHref from "@/hooks/useZoneHref";
import ProductTypeTag from "../../productdetail/ProductTypeTag";

const MAX_ITEMS = 3;

const formatAttributes = (attrs: any) =>
  Array.isArray(attrs) ? attrs.map((a) => `${a?.name}: ${a?.value}`).join(", ") : "";

interface MobileOrderCardProps {
  order: any;
  currency: string;
  statusLabel: string;
  statusCls: string;
  displayTotal: number | string;
  showReorder: boolean;
  onReorder: () => void;
  onTrack?: () => void;
  onCancel?: () => void;
}

// Mobile-only (md:hidden) quick order card matching the app layout.
const MobileOrderCard = ({
  order,
  currency,
  statusLabel,
  statusCls,
  displayTotal,
  showReorder,
  onReorder,
  onTrack,
  onCancel,
}: MobileOrderCardProps) => {
  const zoneHref = useZoneHref();
  const detailHref = zoneHref(`/order-detail/${order?.id}`);
  const items: any[] = order?.items || [];
  const extra = items.length - MAX_ITEMS;
  const price = (v: number | string) => `${currency}${v}`;

  const outlineBtn =
    "flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border primaryBorderColor px-3 py-2 text-xs font-semibold primaryColor";

  return (
    <div className="flex flex-col rounded-xl border border-[var(--border-color)] bg-white px-3.5 dark:bg-zinc-900 md:hidden">
        <Link href={detailHref} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold textColor">
              {order?.order_number ?? `#${order?.id}`}
            </p>
            <p className="mt-0.5 text-[11px] SecondaryTextColor">{formatCustomDate(order?.date)}</p>
            {order?.delivery_type === "pickup" && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                <LuStore size={11} />
                {t("self_pickup") || "Self Pickup"}
              </p>
            )}
          </div>
          <span className={`shrink-0 text-xs font-semibold ${statusCls}`} style={{ border: "none", background: "none" }}>
            {statusLabel}
          </span>
        </Link>

        <div className="flex flex-col gap-2 border-t border-[var(--border-color)] py-3">
          {items.slice(0, MAX_ITEMS).map((it, i) => {
            const unit = it?.discounted_price != 0 ? it?.discounted_price : it?.price;
            const qty = it?.quantity || it?.qty || 1;
            const attrs = formatAttributes(it?.variant_attributes);
            return (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs textColor line-clamp-2">
                    <ProductTypeTag type={it?.product_type} className="me-1 align-[-2px]" iconSize={12} />
                    {qty} x {it?.name}
                  </p>
                  {attrs && <p className="mt-0.5 truncate text-[11px] SecondaryTextColor">{attrs}</p>}
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs font-semibold textColor">
                  {price(unit * qty)}
                </span>
              </div>
            );
          })}
          {extra > 0 && (
            <Link href={detailHref} className="text-[11px] font-semibold primaryColor">
              +{extra} {t("moteItems") || "More Items"}
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-color)] py-3">
          <span className="text-xs SecondaryTextColor">{t("total")}</span>
          <span className="text-sm font-bold textColor">{price(displayTotal)}</span>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] py-3">
          {onTrack ? (
            <button type="button" onClick={onTrack} className={outlineBtn}>
              <TbCurrentLocation size={14} className="shrink-0" />
              <span className="truncate">{t("track_order")}</span>
            </button>
          ) : (
            <Link href={detailHref} className={outlineBtn}>
              <span className="truncate">{t("view_details")}</span>
            </Link>
          )}
          {showReorder && (
            <button
              type="button"
              onClick={onReorder}
              className="flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg primaryBackColor px-3 py-2 text-xs font-semibold text-white"
            >
              <LuRotateCcw size={14} className="shrink-0" />
              <span className="truncate">{t("reorder")}</span>
            </button>
          )}
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mb-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#DB3D26]/40 py-1.5 text-[11px] font-semibold text-[#DB3D26]"
          >
            <LuX size={12} className="shrink-0" />
            {t("cancel")}
          </button>
        )}
    </div>
  );
};

export default MobileOrderCard;
