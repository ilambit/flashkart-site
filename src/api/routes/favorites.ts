"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getFavorite = async ({ latitude, longitude, limit, offset }: any): Promise<any> => {
  const params = {
    latitude: latitude,
    longitude: longitude,
    limit: limit,
    offset: offset,
  };
  const response = await api.get(apiEndPoints.getFavorite, { params });
  return response.data;
};

export const addToFavorite = async ({ product_id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_id", product_id);
  const response = await api.post(
    `${apiEndPoints.getFavorite}/${apiEndPoints.add}`,
    formData
  );
  return response.data;
};

export const removeFromFavorite = async ({ product_id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_id", product_id);
  const response = await api.post(
    `${apiEndPoints.getFavorite}/${apiEndPoints.remove}`,
    formData
  );
  return response.data;
};


export const notifyMe = async ({
  product_variant_id,
  latitude,
  longitude,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_variant_id", product_variant_id);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.notifyMe}`,
    formData,
  );
  return response.data;
};


export const removeNotifyMe = async ({ product_variant_id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_variant_id", product_variant_id);
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.notifyMe}/${apiEndPoints.remove}`,
    formData,
  );
  return response.data;
};
