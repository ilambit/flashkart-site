"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";
import { store } from "@/redux/store";
import { storeClosedResponse, isStoreClosed } from "./_shared";

// Collapses the mount burst (Header + page + StrictMode re-run) into one /cart call.
// Short window so a post-mutation refresh never joins an older, stale request.
const CART_DEDUPE_MS = 100;

const cartInFlight = new Map<string, { at: number; promise: Promise<any> }>();


export const getCart = async ({
  latitude,
  longitude,
  checkout = 0,
  promocode_id = 0,
  order_type,
  address_id,
  delivery_type,
}: any): Promise<any> => {
  const params: Record<string, any> = {
    latitude: latitude,
    longitude: longitude,
  };
  if (promocode_id !== 0) {
    params.promocode_id = promocode_id;
  }
  if (checkout) {
    params.checkout = checkout;
  }
  if (order_type) {
    params.order_type = order_type;
  }
  if (delivery_type) {
    params.delivery_type = delivery_type;
  }
  if (address_id != null) {
    params.address_id = address_id;
  }
  if (process.env.NODE_ENV !== "production") {
  }
  const state = store.getState() as any;
  const key = `${state?.ShopMode?.mode}|${!!state?.User?.jwtToken}|${JSON.stringify(params)}`;
  const now = Date.now();
  const hit = cartInFlight.get(key);
  if (hit && now - hit.at < CART_DEDUPE_MS) return hit.promise;
  const promise = api
    .get(apiEndPoints.getCart, { params })
    .then((response) => response.data)
    .finally(() => {
      if (cartInFlight.get(key)?.promise === promise) cartInFlight.delete(key);
    });
  cartInFlight.set(key, { at: now, promise });
  return promise;
};


export const getCartRecommendations = async ({
  latitude,
  longitude,
  product_id,
  cross_sell_limit = 10,
  cross_sell_offset = 0,
  upsell_limit = 10,
  upsell_offset = 0,
}: any = {}): Promise<any> => {
  const city = store.getState()?.City?.city;
  const params: Record<string, any> = {
    latitude: latitude ?? city?.latitude,
    longitude: longitude ?? city?.longitude,
    cross_sell_limit,
    cross_sell_offset,
    upsell_limit,
    upsell_offset,
  };
  if (product_id != null) params.product_id = product_id;
  const response = await api.get(
    `${apiEndPoints.getCart}/${apiEndPoints.cartRecommendations}`,
    { params }
  );
  return response.data;
};


export const addToBulkCart = async ({
  quick_variant_ids,
  quick_quantities,
  ecommerce_variant_ids,
  ecommerce_quantities,
  quick_items,
  ecommerce_items,
  latitude,
  longitude,
}: any): Promise<any> => {
  const params: Record<string, any> = {};
  // The positional CSV pair has nowhere to put addons, so the items form wins.
  if (quick_items) {
    params.quick_items =
      typeof quick_items === "string" ? quick_items : JSON.stringify(quick_items);
  } else if (quick_variant_ids) {
    params.quick_variant_ids = quick_variant_ids;
    params.quick_quantities = quick_quantities;
  }
  if (ecommerce_items) {
    params.ecommerce_items =
      typeof ecommerce_items === "string"
        ? ecommerce_items
        : JSON.stringify(ecommerce_items);
  } else if (ecommerce_variant_ids) {
    params.ecommerce_variant_ids = ecommerce_variant_ids;
    params.ecommerce_quantities = ecommerce_quantities;
  }
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  const response = await api.post(
    `${apiEndPoints.getCart}/${apiEndPoints.bulkAddToCart}`,
    null,
    { params }
  );
  return response.data;
};


export const addToCart = async ({
  product_id,
  product_variant_id,
  qty,
  latitude,
  longitude,
  addons,
}: any): Promise<any> => {
  if (isStoreClosed()) return storeClosedResponse();
  const city = store.getState()?.City?.city;
  const lat = latitude ?? city?.latitude;
  const lng = longitude ?? city?.longitude;
  const formData = new FormData();
  formData.append("product_id", product_id);
  formData.append("product_variant_id", product_variant_id);
  formData.append("qty", qty);
  if (lat != null) formData.append("latitude", lat);
  if (lng != null) formData.append("longitude", lng);
  // Option ids only — the server resolves the group each one belongs to.
  if (Array.isArray(addons) && addons.length > 0) {
    formData.append("addons", JSON.stringify(addons));
  }
  const response = await api.post(
    `${apiEndPoints.getCart}/${apiEndPoints.add}`,
    formData
  );
  return response.data;
};


export const removeFromCart = async ({
  product_id,
  product_variant_id,
  qty,
  isRemoveAll,
  addons,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_id", product_id);
  formData.append("product_variant_id", product_variant_id);
  formData.append("is_remove_all", (isRemoveAll ? 1 : 0) as any);
  if (qty != null) formData.append("qty", qty);
  // Picks out which line of this product to decrement when several exist.
  if (Array.isArray(addons) && addons.length > 0) {
    formData.append("addons", JSON.stringify(addons));
  }
  const response = await api.post(
    `${apiEndPoints.getCart}/${apiEndPoints.remove}`,
    formData
  );
  return response.data;
};


export const deleteCart = async (): Promise<any> => {
  const formData = new FormData();
  formData.append("is_remove_all", 1 as any);
  const response = await api.post(
    `${apiEndPoints.getCart}/${apiEndPoints.remove}`,
    formData
  );
  return response.data;
};


export const getGuestCart = async ({
  latitude,
  longitude,
  variant_ids,
  quantities,
  delivery_type,
  items,
}: any): Promise<any> => {
  const params: Record<string, any> = {
    latitude: latitude,
    longitude: longitude,
  };
  // items carries a per-row addon list; the CSV pair cannot, so it wins.
  if (items) {
    params.items = typeof items === "string" ? items : JSON.stringify(items);
  } else {
    params.variant_ids = variant_ids;
    params.quantities = quantities;
  }
  if (delivery_type) {
    params.delivery_type = delivery_type;
  }
  const response = await api.get(
    `${apiEndPoints.getCart}/${apiEndPoints.getGuestCart}`,
    { params }
  );
  return response.data;
};


// Promo APIs scope coupons by delivery mode; fall back to the active checkout mode.
const getDeliveryType = (deliveryType?: "delivery" | "pickup") =>
  deliveryType ?? store.getState()?.Checkout?.deliveryType ?? "delivery";


export const getPromo = async ({ amount = 0, latitude, longitude, deliveryType }: any): Promise<any> => {
  const params: Record<string, any> = { amount: amount, delivery_type: getDeliveryType(deliveryType) };
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  const response = await api.get(`${apiEndPoints.getPromoCode}`, { params });
  return response.data;
};

export const setPromoCode = async ({ promoCodeName, amount = 0, latitude, longitude, deliveryType }: any): Promise<any> => {
  const params: Record<string, any> = {
    promo_code: promoCodeName,
    total: amount,
    delivery_type: getDeliveryType(deliveryType),
  };
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  const response = await api.post(
    `${apiEndPoints.getPromoCode}/${apiEndPoints.setPromoCode}`,
    {},
    { params }
  );
  return response.data;
};
