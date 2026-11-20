"use client";

import { useState } from "react";
import { LuSlidersHorizontal } from "react-icons/lu";
import { RiCloseFill } from "react-icons/ri";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { t } from "@/utils/translation";

// get_user_transactions `filter`; "" = all. Desktop: pill chips. Mobile: icon button + bottom sheet like the app.
interface TransactionFilterTabsProps {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}

const TransactionFilterTabs = ({ options, active, onChange }: TransactionFilterTabsProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const all = ["", ...options];

  const select = (key: string) => {
    setSheetOpen(false);
    if (key !== active) onChange(key);
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        {all.map((key) => {
          const isActive = active === key;
          return (
            <button
              key={key || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => select(key)}
              className={`shrink-0 rounded-full border px-3.5 py-1 text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? "primaryColorBorder primaryLightBack primaryColor font-semibold"
                  : "cardBorder !rounded-full SecondaryTextColor font-medium hover:textColor"
              }`}
            >
              {t(key || "all")}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t("filter") || "Filter"}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition active:scale-90 md:hidden ${
          active ? "primaryBorderColor primaryLightBack primaryColor" : "cardBorder !rounded-full textColor"
        }`}
      >
        <LuSlidersHorizontal size={17} />
        {active && (
          <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full primaryBackColor" />
        )}
      </button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 md:hidden">
          <div className="flex items-center justify-between border-b cardBorder px-4 py-3">
            <SheetTitle className="text-base font-bold textColor">
              {t("filter") || "Filter"}
            </SheetTitle>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label={t("close") || "Close"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 active:scale-90"
            >
              <RiCloseFill size={18} />
            </button>
          </div>
          <div role="radiogroup" className="flex flex-col py-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {all.map((key) => {
              const isActive = active === key;
              return (
                <button
                  key={key || "all"}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => select(key)}
                  className="flex items-center justify-between px-4 py-3.5 text-start active:bg-black/5"
                >
                  <span className={`text-[15px] ${isActive ? "primaryColor font-semibold" : "textColor font-medium"}`}>
                    {t(key || "all")}
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isActive ? "primaryBorderColor" : "border-gray-300 dark:border-zinc-600"
                    }`}
                  >
                    {isActive && <span className="h-2.5 w-2.5 rounded-full primaryBackColor" />}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TransactionFilterTabs;
