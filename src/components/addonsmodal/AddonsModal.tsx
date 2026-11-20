import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { RiCloseFill } from "react-icons/ri";
import { FiMinus, FiPlus } from "react-icons/fi";
import {
  Dialog as DialogRaw,
  DialogContent as DialogContentRaw,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import * as api from "@/api/apiRoutes";
import { t } from "@/utils/translation";
import useCurrency from "@/hooks/useCurrency";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import ProductTypeTag from "../productdetail/ProductTypeTag";
import AddonGroupsList from "./AddonGroupsList";
import useHydratedMediaQuery from "@/hooks/useHydratedMediaQuery";
import { flyToCart } from "@/utils/flyToCart";
import {
  addGuestCartTotal,
  addtoGuestCart,
  setCart,
  setCartProducts,
  setCartSubTotal,
} from "@/redux/slices/cartSlice";
import {
  addonFingerprint,
  addonUnitTotal,
  defaultAddonDraft,
  draftToLineAddons,
  toAddonPayload,
  validateAddonDraft,
} from "@/utils/addons";
import type { AddonDraft, AddonGroup } from "@/types/api/addons";

// dialog.tsx exports are untyped forwardRef components, so TS infers overly
// narrow prop types. Same cast VariantsModal uses.
const Dialog = DialogRaw as any;
const DialogContent = DialogContentRaw as any;

interface AddonsModalProps {
  /** Card row or full product — shapes vary, no shared exported type yet. */
  product: any;
  showAddons: boolean;
  setShowAddons: (show: boolean) => void;
  /** Variant the caller already picked; defaults to the first in-stock one. */
  variant?: any;
  /** Dish quantity to add, 1 unless the caller is a detail-page stepper. */
  qty?: number;
  /** Runs after the line actually reaches the cart, not on open. */
  onAdded?: (response?: any) => void;
  /** Opened over another dialog: that one already dims the page. */
  stacked?: boolean;
}

const AddonsModal = ({
  product,
  showAddons,
  setShowAddons,
  variant,
  qty = 1,
  onAdded,
  stacked = false,
}: AddonsModalProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.Cart);
  const city = useAppSelector((state) => state.City.city);
  const isMobile = useHydratedMediaQuery("(max-width: 767px)") === true;
  const { currency: liveCurrency } = useCurrency();
  const currency = product?.currency || liveCurrency;

  const [groups, setGroups] = useState<AddonGroup[]>(product?.addon_groups ?? []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<AddonDraft>({});
  // Mobile sheet has its own stepper; desktop still adds the caller's qty.
  const [sheetQty, setSheetQty] = useState(qty);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const variants = product?.variants ?? [];
  const [pickedVariant, setPickedVariant] = useState<any>(null);
  const activeVariant = useMemo(
    () => pickedVariant ?? variant ?? variants[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickedVariant, variant, product?.variants],
  );

  // Listing cards only carry has_addons, so the groups are fetched on open.
  // Same coordinates as the add call below — the store decides which options
  // exist and what they cost.
  useEffect(() => {
    if (!showAddons) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the selection whenever the sheet opens (or opens for a different product)
    setPickedVariant(null);
    setSheetQty(qty);
    if (product?.addon_groups?.length) {
      setGroups(product.addon_groups);
      setDraft(defaultAddonDraft(product.addon_groups));
      return;
    }
    setDraft({});
    let cancelled = false;
    setLoading(true);
    api
      .getProductById({
        id: product?.id,
        latitude: city?.latitude,
        longitude: city?.longitude,
      })
      .then((response: any) => {
        if (cancelled) return;
        const row = Array.isArray(response?.data) ? response.data[0] : response?.data;
        const fetched = row?.addon_groups ?? [];
        setGroups(fetched);
        setDraft(defaultAddonDraft(fetched));
      })
      .catch((error: any) => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, showAddons]);

  const unitAddonTotal = addonUnitTotal(groups, draft);
  const variantPrice =
    activeVariant?.discounted_price && activeVariant?.discounted_price !== 0
      ? activeVariant.discounted_price
      : activeVariant?.price;
  // Display only — the server folds addon money into the line price itself.
  const lineTotal = ((Number(variantPrice) || 0) + unitAddonTotal) * sheetQty;

  const close = () => setShowAddons(false);

  // Same label rule VariantsModal uses.
  const variantLabel = (row: any) => {
    const at = row?.attributes_text;
    if (at && Number.isNaN(Number(at))) return at;
    const tail = row?.name?.split("||").pop()?.trim();
    return (
      tail ||
      `${row?.measurement ?? ""} ${row?.unit?.translations?.short_code ?? row?.unit?.short_code ?? ""}`.trim() ||
      row?.name
    );
  };

  const addGuestLine = (addons: ReturnType<typeof toAddonPayload>) => {
    const row = {
      product_id: product?.id,
      product_variant_id: activeVariant?.id,
      qty: sheetQty,
      productPrice: (Number(variantPrice) || 0) + unitAddonTotal,
      // Cart-line shape, so a guest row renders like a server row.
      addons: draftToLineAddons(groups, draft),
      addon_total: unitAddonTotal * sheetQty,
      // Two lines of the same variant differ only by their picks.
      addon_fingerprint: addonFingerprint(addons),
    };
    dispatch(addtoGuestCart({ data: [...(cart?.guestCart ?? []), row] }));
    dispatch(addGuestCartTotal({ data: row.productPrice * sheetQty }));
    toast.success(t("product_added_successfully"));
    launchFlight();
    close();
    onAdded?.();
  };

  // Fired while the sheet is still mounted — flyToCart measures the hero image
  // at call time, so closing first would leave nothing to fly.
  const launchFlight = () => {
    flyToCart(addButtonRef.current, "[data-addon-fly-image]");
  };

  const syncServerCart = (response: any) => {
    const serverCart = response?.data?.cart?.map((item: any) => ({
      product_id: item?.id,
      product_variant_id: item?.variant_id,
      addons: item?.addons ?? [],
      qty: item?.variants?.[0]?.quantity ?? item?.quantity,
    }));
    dispatch(setCart({ data: response }));
    dispatch(setCartProducts({ data: serverCart ?? [] }));
    dispatch(setCartSubTotal({ data: response?.data?.sub_total }));
  };

  const handleAdd = async () => {
    const error = validateAddonDraft(groups, draft);
    if (error) {
      toast.error(error);
      return;
    }
    const addons = toAddonPayload(draft);
    if (cart?.isGuest) {
      addGuestLine(addons);
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.addToCart({
        product_id: product?.id,
        product_variant_id: activeVariant?.id,
        qty: sheetQty,
        latitude: city?.latitude,
        longitude: city?.longitude,
        addons,
      });
      // A rejected add is still HTTP 200 — check status, not the code.
      if (response?.status === 1) {
        syncServerCart(response);
        toast.success(t("product_added_successfully"));
        launchFlight();
        close();
        onAdded?.(response);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile follows the app: grey backdrop, each question its own white card.
  const appStyle = isMobile;

  const body = (
    <div
      className={`min-h-0 flex-1 overflow-y-auto custom-scrollbar ${
        appStyle
          ? "space-y-3 bg-[var(--container-bg)] px-3 py-3"
          : "px-4 pb-4 pt-4 md:px-6"
      }`}
    >
      {variants.length > 1 &&
        (appStyle ? (
          <div className="rounded-2xl bg-white px-3.5 py-3.5 dark:bg-zinc-900">
            <div className="text-[15px] font-bold capitalize textColor">
              {t("variants")}
            </div>
            <div className="mt-3 border-t border-dashed border-gray-200 dark:border-zinc-800" />
            {variants.map((row: any) => {
              const picked = row?.id === activeVariant?.id;
              const cut =
                row?.discounted_price && row?.discounted_price !== row?.price;
              return (
                <button
                  key={row?.id}
                  type="button"
                  onClick={() => setPickedVariant(row)}
                  className="flex w-full items-center gap-2.5 py-2.5 text-start"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] capitalize textColor">
                    {variantLabel(row)}
                  </span>
                  {cut && (
                    <span className="whitespace-nowrap text-[11px] text-gray-400 line-through">
                      {currency}
                      {row?.price}
                    </span>
                  )}
                  <span className="whitespace-nowrap text-[13px] font-semibold textColor">
                    {currency}
                    {cut ? row?.discounted_price : row?.price}
                  </span>
                  <span
                    role="radio"
                    aria-checked={picked}
                    className={`flex aspect-square h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      picked
                        ? "primaryColorBorder"
                        : "border-gray-300 dark:border-zinc-600"
                    }`}
                  >
                    {picked && (
                      <span className="block h-2 w-2 shrink-0 rounded-full primaryBackColor" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pb-4">
            <div className="mb-2 text-sm font-semibold text-gray-500">
              {t("variants")}
            </div>
            <div className="flex flex-wrap gap-2">
              {variants.map((row: any) => (
                <button
                  key={row?.id}
                  type="button"
                  onClick={() => setPickedVariant(row)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition ${
                    row?.id === activeVariant?.id
                      ? "primaryColorBorder primaryLightBack primaryColor"
                      : "border-gray-100 dark:border-zinc-800 textColor hover:border-gray-200 dark:hover:border-zinc-700"
                  }`}
                >
                  {variantLabel(row)}
                </button>
              ))}
            </div>
          </div>
        ))}

      <AddonGroupsList
        groups={groups}
        draft={draft}
        setDraft={setDraft}
        currency={currency}
        loading={loading}
        appStyle={appStyle}
      />
    </div>
  );

  // App-style bar: stepper beside one wide button carrying the line total.
  const appFooter = (
    <div className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-11 shrink-0 items-center gap-2.5 rounded-xl border primaryColorBorder primaryLightBack px-2.5">
        <button
          type="button"
          aria-label={t("decrease")}
          onClick={() => setSheetQty((n) => Math.max(1, n - 1))}
          disabled={sheetQty <= 1}
          className="flex h-6 w-6 items-center justify-center primaryColor disabled:opacity-40"
        >
          <FiMinus size={14} />
        </button>
        <span className="min-w-5 text-center text-sm font-bold primaryColor">
          {sheetQty}
        </span>
        <button
          type="button"
          aria-label={t("increase")}
          onClick={() => setSheetQty((n) => n + 1)}
          className="flex h-6 w-6 items-center justify-center primaryColor"
        >
          <FiPlus size={14} />
        </button>
      </div>
      <button
        ref={addButtonRef}
        type="button"
        onClick={handleAdd}
        disabled={submitting || loading}
        className="h-11 flex-1 rounded-xl primaryBackColor text-sm font-bold text-white transition active:scale-95 disabled:opacity-60"
      >
        {t("add_to_cart")} {currency}
        {lineTotal}
      </button>
    </div>
  );

  // Mirrors VariantsModal's bottom bar: price on the left, action on the right.
  const footer = (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-gray-500">{t("total")}</span>
        <span className="truncate text-xl font-bold primaryColor">
          {currency}
          {lineTotal}
        </span>
      </div>
      <button
        ref={addButtonRef}
        type="button"
        onClick={handleAdd}
        disabled={submitting || loading}
        className="h-11 shrink-0 rounded-lg primaryBackColor px-6 text-sm font-bold uppercase text-white transition active:scale-95 disabled:opacity-60"
      >
        {t("add_to_cart")}
      </button>
    </div>
  );

  // product rows carry the variant label in name; product_name is the dish.
  const title =
    product?.translations?.name ?? product?.product_name ?? product?.name;

  const heroImage =
    activeVariant?.image ??
    product?.images?.[0]?.image_url ??
    product?.image_url;

  const hasVariantDiscount =
    activeVariant?.discounted_price !== 0 &&
    activeVariant?.discounted_price !== activeVariant?.price;

  // API-sent percent only, same rule the cards follow.
  const discountPercent =
    Number(activeVariant?.discount_percent ?? product?.discount_percent) || null;

  if (isMobile) {
    return (
      <Sheet open={showAddons} onOpenChange={(open: boolean) => !open && close()}>
        <SheetContent
          side="bottom"
          className={`flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-t-3xl border-0 bg-white p-0 duration-300 dark:bg-zinc-900 ${
            stacked ? "z-[61]" : ""
          }`}
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <span className="h-1 w-10 rounded-full bg-gray-300 dark:bg-zinc-700" />
          </div>
          <SheetTitle className="flex items-center gap-3 px-4 pb-4 pt-2 text-start">
            <span
              data-addon-fly-image
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800"
            >
              <ImageWithPlaceholder
                src={heroImage}
                alt={title}
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
              {!!discountPercent && (
                <span className="absolute inset-x-0 bottom-0 bg-green-600/90 py-0.5 text-center text-[9px] font-bold uppercase leading-none text-white">
                  {discountPercent}% {t("off")}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <ProductTypeTag
                  type={product?.product_type ?? product?.indicator}
                  iconSize={14}
                />
                <span className="line-clamp-2 text-[15px] font-bold capitalize textColor">
                  {title}
                </span>
              </span>
              <span className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold textColor">
                  {currency}
                  {variantPrice}
                </span>
                {hasVariantDiscount && (
                  <span className="text-[11px] text-gray-400 line-through">
                    {currency}
                    {activeVariant?.price}
                  </span>
                )}
              </span>
            </span>
          </SheetTitle>
          {body}
          {appFooter}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={showAddons} onOpenChange={(open: boolean) => !open && close()}>
      <DialogContent
        className={`flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0 duration-300 ${
          stacked ? "z-[61]" : ""
        }`}
        overlayClassName={stacked ? "bg-transparent backdrop-blur-0" : undefined}
        title={title}
      >
        {/* compact header — thumb beside the dish, no letterboxed hero */}
        <div className="relative flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-4 pe-14 dark:border-zinc-800 md:px-6 md:pe-14">
          <span
            data-addon-fly-image
            className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800"
          >
            <ImageWithPlaceholder
              src={heroImage}
              alt={title}
              width={160}
              height={160}
              className="h-full w-full object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-base font-bold capitalize textColor">
              {title}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-sm font-semibold textColor">
                {currency}
                {variantPrice}
              </span>
              {hasVariantDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {currency}
                  {activeVariant?.price}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label={t("close")}
            onClick={close}
            className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <RiCloseFill size={20} />
          </button>
        </div>

        {body}
        {footer}
      </DialogContent>
    </Dialog>
  );
};

export default AddonsModal;
