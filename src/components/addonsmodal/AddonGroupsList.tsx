import { toast } from "react-toastify";
import Image from "next/image";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { t } from "@/utils/translation";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { getProductTypeMeta } from "../productdetail/productType";
import {
  isGroupFull,
  optionQty,
  setOptionQty,
  setRadioPick,
} from "@/utils/addons";
import type { AddonDraft, AddonGroup, AddonOption } from "@/types/api/addons";

interface AddonGroupsListProps {
  groups: AddonGroup[];
  draft: AddonDraft;
  setDraft: React.Dispatch<React.SetStateAction<AddonDraft>>;
  /** Line currency, so the sheet and the cart row read alike. */
  currency: string;
  loading?: boolean;
  /** Mobile app look: one white card per group, borderless rows. */
  appStyle?: boolean;
}

// Every question with its options. Shared by the add sheet and the cart's
// edit screen, so both read and behave the same.
const AddonGroupsList = ({
  groups,
  draft,
  setDraft,
  currency,
  loading = false,
  appStyle = false,
}: AddonGroupsListProps) => {
  const toggleOption = (group: AddonGroup, option: AddonOption) => {
    if (group.input_type === "radio") {
      setDraft((current) => setRadioPick(current, group, option.id));
      return;
    }
    const current = optionQty(draft, group.id, option.id);
    if (current === 0 && isGroupFull(group, draft)) {
      toast.error(t("addon_too_many_options"));
      return;
    }
    setDraft((state) => setOptionQty(state, group, option, current > 0 ? 0 : 1));
  };

  const step = (group: AddonGroup, option: AddonOption, delta: number) => {
    const current = optionQty(draft, group.id, option.id);
    if (current === 0 && delta > 0 && isGroupFull(group, draft)) {
      toast.error(t("addon_too_many_options"));
      return;
    }
    if (delta > 0 && current >= (option.max_qty || 1)) {
      toast.error(t("addon_too_many_of_one_option"));
      return;
    }
    setDraft((state) => setOptionQty(state, group, option, current + delta));
  };

  const renderOption = (group: AddonGroup, option: AddonOption) => {
    const quantity = optionQty(draft, group.id, option.id);
    const picked = quantity > 0;
    const discounted = option.original_price > option.price;
    // Same diet mark the product cards draw; nothing for 0.
    const typeMeta = getProductTypeMeta(option.product_type);
    const isRadio = group.input_type === "radio";
    // Stepper replaces the tick when one option may be taken more than once.
    const stepperAllowed =
      !isRadio && group.max_qty_per_option > 1 && (option.max_qty || 1) > 1;

    // App layout: diet mark + name left, prices right, control last.
    if (appStyle) {
      return (
        <div
          key={option.id}
          role="button"
          tabIndex={0}
          onClick={() => !stepperAllowed && toggleOption(group, option)}
          onKeyDown={(e) =>
            e.key === "Enter" && !stepperAllowed && toggleOption(group, option)
          }
          className={`flex items-center gap-2.5 py-2.5 ${stepperAllowed ? "" : "cursor-pointer"}`}
        >
          {option.image && (
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white dark:border-zinc-800">
              <ImageWithPlaceholder
                src={option.image}
                alt={option.name}
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </span>
          )}
          {typeMeta?.svg && (
            <span className="relative h-4 w-4 shrink-0">
              <Image
                src={typeMeta.svg}
                fill
                alt={t(typeMeta.labelKey)}
                className="object-contain"
              />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[13px] capitalize textColor">
            {option.name}
          </span>
          {option.price !== 0 && (
            <span className="flex shrink-0 items-baseline gap-1.5">
              {discounted && (
                <span className="whitespace-nowrap text-[11px] text-gray-400 line-through">
                  {currency}
                  {option.original_price}
                </span>
              )}
              <span className="whitespace-nowrap text-[13px] font-semibold textColor">
                {`+${currency}${option.price}`}
              </span>
            </span>
          )}
          {stepperAllowed ? (
            <span
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 shrink-0 items-center gap-2 rounded-lg border primaryColorBorder px-2"
            >
              <button
                type="button"
                onClick={() => step(group, option, -1)}
                aria-label={t("decrease")}
                className="flex h-5 w-5 items-center justify-center"
              >
                <FiMinus size={13} className="primaryColor" />
              </button>
              <span className="min-w-4 text-center text-sm font-bold primaryColor">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => step(group, option, 1)}
                aria-label={t("increase")}
                className="flex h-5 w-5 items-center justify-center"
              >
                <FiPlus size={13} className="primaryColor" />
              </button>
            </span>
          ) : (
            <span
              role={isRadio ? "radio" : "checkbox"}
              aria-checked={picked}
              className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition ${
                isRadio ? "aspect-square rounded-full" : "rounded-[5px]"
              } ${picked ? "primaryColorBorder" : "border-gray-300 dark:border-zinc-600"}`}
            >
              {picked &&
                (isRadio ? (
                  <span className="block h-2 w-2 shrink-0 rounded-full primaryBackColor" />
                ) : (
                  <FiCheck size={12} strokeWidth={3} className="primaryColor" />
                ))}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        key={option.id}
        role="button"
        tabIndex={0}
        onClick={() => !stepperAllowed && toggleOption(group, option)}
        onKeyDown={(e) =>
          e.key === "Enter" && !stepperAllowed && toggleOption(group, option)
        }
        className={`flex items-center ${stepperAllowed ? "" : "cursor-pointer"} gap-3 rounded-lg border bg-white px-3 py-2.5 transition dark:bg-transparent ${
          picked
            ? "primaryColorBorder"
            : "border-gray-100 hover:border-gray-200 dark:border-zinc-800 dark:hover:border-zinc-700"
        }`}
      >
        {!stepperAllowed && (
          <span
            role={isRadio ? "radio" : "checkbox"}
            aria-checked={picked}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border-2 transition ${
              isRadio ? "aspect-square rounded-full" : "rounded-[5px]"
            } ${picked ? "primaryColorBorder" : "border-gray-300 dark:border-zinc-600"}`}
          >
            {picked &&
              (isRadio ? (
                <span className="block h-1.5 w-1.5 shrink-0 rounded-full primaryBackColor" />
              ) : (
                <FiCheck size={12} strokeWidth={3} className="primaryColor" />
              ))}
          </span>
        )}

        {option.image && (
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white dark:border-zinc-800">
            <ImageWithPlaceholder
              src={option.image}
              alt={option.name}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          </span>
        )}

        {/* Name over price: the name keeps the whole row width, so a long
            option label never truncates to make room for the price. */}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            {typeMeta?.svg && (
              <span className="relative h-3.5 w-3.5 shrink-0">
                <Image
                  src={typeMeta.svg}
                  fill
                  alt={t(typeMeta.labelKey)}
                  className="object-contain"
                />
              </span>
            )}
            <span className="truncate text-sm capitalize textColor">
              {option.name}
            </span>
          </span>
          {option.price !== 0 && (
            <span className="flex items-baseline gap-1.5">
              <span className="whitespace-nowrap text-xs font-semibold primaryColor">
                {`+${currency}${option.price}`}
              </span>
              {discounted && (
                <span className="whitespace-nowrap text-[11px] text-gray-400 line-through">
                  {currency}
                  {option.original_price}
                </span>
              )}
            </span>
          )}
        </span>

        {/* Both controls stay mounted and cross-fade in place, so the + swaps
            into the stepper instead of popping. */}
        {stepperAllowed && (
          <span
            onClick={(e) => e.stopPropagation()}
            className={`relative h-7 shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              picked ? "w-[92px]" : "w-7"
            }`}
          >
            <span
              aria-hidden={!picked}
              className={`absolute inset-y-0 end-0 flex w-[92px] items-center justify-between rounded-lg border primaryColorBorder px-2 transition duration-200 ${
                picked
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-75 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={() => step(group, option, -1)}
                aria-label={t("decrease")}
                tabIndex={picked ? 0 : -1}
                className="flex h-5 w-5 items-center justify-center transition active:scale-90"
              >
                <FiMinus size={12} className="primaryColor" />
              </button>
              <span
                key={quantity}
                className="min-w-4 text-center text-xs font-bold primaryColor"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => step(group, option, 1)}
                aria-label={t("increase")}
                tabIndex={picked ? 0 : -1}
                className="flex h-5 w-5 items-center justify-center transition active:scale-90"
              >
                <FiPlus size={12} className="primaryColor" />
              </button>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(group, option, 1);
              }}
              aria-label={t("increase")}
              aria-hidden={picked}
              tabIndex={picked ? -1 : 0}
              className={`absolute inset-y-0 end-0 flex w-7 items-center justify-center rounded-lg border primaryColorBorder primaryLightBack transition duration-200 active:scale-90 ${
                picked
                  ? "pointer-events-none rotate-90 scale-50 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }`}
            >
              <FiPlus size={14} className="primaryColor" />
            </button>
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {loading && (
        <p className="py-10 text-center text-sm text-gray-500">{t("loading")}</p>
      )}

      {!loading &&
        groups.map((group, index) => (
          <div
            key={group.id}
            className={
              appStyle
                ? "rounded-2xl bg-white px-3.5 py-3.5 dark:bg-zinc-900"
                : index > 0
                  ? "mt-5 border-t border-gray-100 pt-5 dark:border-zinc-800"
                  : ""
            }
          >
            <div className={appStyle ? "" : "mb-2.5"}>
              <div
                className={`font-bold capitalize textColor ${appStyle ? "text-[15px]" : "text-base"}`}
              >
                {group.name}
              </div>
              {/* Backend-generated sentence — never recomposed from the numbers. */}
              <div
                className={`mt-0.5 text-gray-500 ${appStyle ? "text-[11px]" : "text-xs"}`}
              >
                {group.selection_text}
              </div>
            </div>
            {appStyle && (
              <div className="mt-2.5 border-t border-dashed border-gray-200 dark:border-zinc-800" />
            )}
            <div className={appStyle ? "" : "flex flex-col gap-2"}>
              {(group.options ?? []).map((option) => renderOption(group, option))}
            </div>
          </div>
        ))}

      {!loading && groups.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          {t("no_data_found")}
        </p>
      )}
    </>
  );
};

export default AddonGroupsList;
