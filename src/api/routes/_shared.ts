"use client";
import { store } from "@/redux/store";
import { t } from "@/utils/translation";

export const storeClosedResponse = () => ({
  status: 0,
  message: t("store_closed_cannot_order"),
});


export const isStoreClosed = () => store.getState()?.ShopMode?.storeClosed === true;
