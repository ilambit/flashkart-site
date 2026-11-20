"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";
import { storeClosedResponse, isStoreClosed } from "./_shared";

export const placeOrder = async ({
  productVariantId,
  quantity,
  total,
  deliveryCharge,
  finalTotal,
  paymentMethod,
  addressId,
  walletBalance,
  walletUsed,
  orderNote,
  promocodeId = 0,
  status,
  delivery_type,
  prescriptions = null,
  billingSameAsShipping = true,
  billingName = "",
  billingMobile = "",
  billingCountryCode = "",
  billingAddress = "",
  billingCity = "",
  billingState = "",
  billingPincode = "",
  billingCountry = "",
  billingRegionId,
  buyerTaxNumber = "",
  buyerBusinessName = "",
  latitude,
  longitude,
}: any): Promise<any> => {
  if (isStoreClosed()) return storeClosedResponse();
  let finalPaymentMethod = paymentMethod;
  if (paymentMethod == "wallet") {
    finalPaymentMethod = "Wallet";
  }
  const formData = new FormData();
  formData.append("product_variant_id", productVariantId);
  formData.append("quantity", quantity);
  formData.append("total", total);
  formData.append("delivery_charge", deliveryCharge);
  formData.append("final_total", finalTotal);
  formData.append("payment_method", finalPaymentMethod);
  if (addressId != null) {
    formData.append("address_id", addressId);
  }
  formData.append("status", status);
  if (delivery_type) {
    formData.append("delivery_type", delivery_type);
  }
  if (latitude != null && longitude != null) {
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
  }
  if (walletUsed) {
    formData.append("wallet_used", 1 as any);
    formData.append("wallet_balance", walletBalance);
  }
  if (orderNote !== "" && orderNote !== null && orderNote !== undefined) {
    formData.append("order_note", orderNote);
  }
  if (promocodeId !== 0) {
    formData.append("promocode_id", promocodeId);
  }
  const isPickupNoAddress = delivery_type === "pickup" && addressId == null;
  if (delivery_type !== "pickup") {
    formData.append("billing_same_as_shipping", (billingSameAsShipping ? 1 : 0) as any);
  }
  if (isPickupNoAddress || (delivery_type !== "pickup" && !billingSameAsShipping)) {
    formData.append("billing_name", billingName);
    formData.append("billing_mobile", billingMobile);
    formData.append("billing_country_code", billingCountryCode);
    formData.append("billing_address", billingAddress);
    formData.append("billing_city", billingCity);
    formData.append("billing_state", billingState);
    formData.append("billing_pincode", billingPincode);
    formData.append("billing_country", billingCountry);
    if (billingRegionId != null) formData.append("billing_region_id", billingRegionId);
  }
  // Order-level, whichever address is billed; empty is a normal consumer order.
  if (String(buyerTaxNumber ?? "").trim())
    formData.append("buyer_tax_number", String(buyerTaxNumber).trim());
  if (String(buyerBusinessName ?? "").trim())
    formData.append("buyer_business_name", String(buyerBusinessName).trim());
  if (prescriptions && typeof prescriptions === "object") {
    Object.entries(prescriptions).forEach(([vid, file]) => {
      if (file instanceof File) {
        formData.append(`prescription[${vid}]`, file);
      }
    });
  }
  const response = await api.post(`${apiEndPoints.placeOrder}`, formData);
  return response.data;
};

export const deleteOrder = async ({ orderId }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_id", orderId);
  const response = await api.post(`${apiEndPoints.deleteOrder}`, formData);
  return response.data;
};


export const getOrders = async ({
  limit,
  offset,
  orderId,
  type,
  orderType,
  channel,
  startDate,
  endDate,
}: any): Promise<any> => {
  const params: Record<string, any> = { limit: limit, offset: offset, type: type };
  if (orderId) {
    params.order_id = orderId;
  }
  if (orderType != "") {
    params.order_type = orderType;
  }
  if (channel) {
    params.channel = channel;
  }
  if (startDate) {
    params.start_date = startDate;
  }
  if (endDate) {
    params.end_date = endDate;
  }
  const response = await api.get(`${apiEndPoints.getOrders}`, { params });
  return response.data;
};


export const getEcomOrders = async ({
  limit,
  offset,
  type,
  orderType,
  startDate,
  endDate,
}: any): Promise<any> => {
  const params: Record<string, any> = { limit, offset, type };
  if (orderType != null && orderType !== "") {
    params.order_type = orderType;
  }
  if (startDate) {
    params.start_date = startDate;
  }
  if (endDate) {
    params.end_date = endDate;
  }
  const response = await api.get(`${apiEndPoints.ecomOrders}`, { params });
  return response.data;
};


export const getEcomOrderDetail = async ({ orderItemId }: any): Promise<any> => {
  const params = { order_item_id: orderItemId };
  const response = await api.get(`${apiEndPoints.ecomOrders}`, { params });
  return response.data;
};


export const changeOrderStatus = async ({
  orderId,
  orderItemId,
  status,
  reason,
  returnReason,
  addressId,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_id", orderId);
  formData.append("order_item_id", orderItemId);
  formData.append("status", status);
  if (reason) {
    formData.append("cancellation_reason", reason);
  }
  if (returnReason) {
    formData.append("return_reason", returnReason);
  }
  if (addressId) {
    formData.append("address_id", addressId);
  }
  const response = await api.post(
    `${apiEndPoints.updateOrderStatus}`,
    formData
  );
  return response.data;
};


export const downloadInvoice = async ({ orderId }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_id", orderId);
  const response = await api.post(`${apiEndPoints.getInvoice}`, formData, {
    responseType: "blob",
  });
  return response;
};


export const downloadItemInvoice = async ({ orderItemId }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_item_id", orderItemId);
  const response = await api.post(`${apiEndPoints.getItemInvoice}`, formData, {
    responseType: "blob",
  });
  return response;
};


export const liveOrderTracking = async ({ orderId }: any): Promise<any> => {
  const params = {
    order_id: orderId,
  };
  const response = await api.get(`${apiEndPoints.liveTracking}`, { params });
  return response.data;
};


// 1.6.0: order_id for an order, latitude/longitude for a wallet recharge
export const getOrderStatusPhonepe = async ({
  transaction_id,
  order_id,
  latitude,
  longitude,
}: any): Promise<any> => {
  const params: Record<string, any> = { transaction_id };
  if (order_id) params.order_id = order_id;
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;

  const response = await api.get(apiEndPoints.orderStatusPhonepe, { params });
  return response.data;
};
