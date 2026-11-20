"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";
import { store } from "@/redux/store";

export const initiateTrasaction = async ({
  orderId,
  paymentMethod,
  type,
  walletAmount = 0,
  latitude,
  longitude,
}: any): Promise<any> => {
  const formData = new FormData();
  if (orderId) {
    formData.append("order_id", orderId);
  }
  formData.append(
    "payment_method",
    typeof paymentMethod === "string" && paymentMethod.toLowerCase() === "payu"
      ? "payu"
      : paymentMethod
  );
  formData.append("type", type);
  formData.append("request_from", "website");
  const city = store.getState()?.City?.city;
  const lat = latitude ?? city?.latitude;
  const lng = longitude ?? city?.longitude;
  if (lat != null) formData.append("latitude", lat);
  if (lng != null) formData.append("longitude", lng);
  if (type == "wallet" && walletAmount != 0) {
    formData.append("wallet_amount", walletAmount);
  }
  const response = await api.post(
    `${apiEndPoints.initiateTrasaction}`,
    formData
  );
  return response.data;
};

export const addTransaction = async ({
  orderId,
  transactionId,
  paymentMethod,
  type,
  walletAmount = 0,
  latitude,
  longitude,
}: any): Promise<any> => {
  const formData = new FormData();
  if (orderId) {
    formData.append("order_id", orderId);
  }
  if (walletAmount != 0 && type == "wallet") {
    formData.append("wallet_amount", walletAmount);
  }
  if (latitude !== undefined && latitude !== null && latitude !== "") {
    formData.append("latitude", latitude);
  }
  if (longitude !== undefined && longitude !== null && longitude !== "") {
    formData.append("longitude", longitude);
  }
  formData.append("transaction_id", transactionId);
  formData.append("type", type);
  formData.append("payment_method", paymentMethod);
  formData.append("request_from", "website");
  formData.append("device_type", "web");
  formData.append("app_version", "1.0");
  const response = await api.post(`${apiEndPoints.addTransaction}`, formData);
  return response.data;
};


export const getUserTransactions = async ({ limit, offset, type, filter }: any): Promise<any> => {
  const params: any = { limit: limit, offset: offset, type: type };
  if (filter) params.filter = filter;
  const response = await api.get(`${apiEndPoints.getTransactions}`, { params });
  return response.data;
};
