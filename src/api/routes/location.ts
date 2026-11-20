"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getPlaces = async ({ input }: any): Promise<any> => {
  const params = { input: input, source: "web" };

  const response = await api.get(apiEndPoints.getPlaces, { params });
  return response.data;
};


export const getPlacesDetails = async ({ placeId }: any): Promise<any> => {
  const params = { place_id: placeId, source: "web" };
  const response = await api.get(apiEndPoints.getPlacecDetails, { params });
  return response.data;
};


export const getGeocoding = async ({ latitude, longitude }: any): Promise<any> => {
  const params = { latitude, longitude, source: "web" };
  const response = await api.get(apiEndPoints.getGeocoding, { params });
  return response.data;
};


export const getZone = async ({ latitude, longitude, channel }: any): Promise<any> => {
  const params = { latitude: latitude, longitude: longitude };
  // channel overrides the store-derived header — used to retry in a zone's own channel.
  const config: any = { params };
  if (channel) config.headers = { channel };
  const response = await api.get(apiEndPoints.getZone, config);
  return response.data;
};


export const getZones = async ({ country_id }: any = {}): Promise<any> => {
  const params = country_id ? { country_id } : {};
  const response = await api.get(apiEndPoints.getZones, { params });
  return response.data;
};


export const getRegions = async ({ country_id }: any = {}): Promise<any> => {
  const params = country_id ? { country_id } : {};
  const response = await api.get(apiEndPoints.getRegions, { params });
  return response.data;
};


export const getCountriesWithDefault = async (): Promise<any> => {
  const response = await api.get(apiEndPoints.getCountries);
  return response.data;
};


export const getDialCountries = async (): Promise<any> => {
  const response = await api.get(apiEndPoints.getCountries);
  return response.data;
};


export const checkServiceability = async ({
  pincode,
  latitude,
  longitude,
  productVariantId,
  quantity,
  storeId,
  cod,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("pincode", pincode);
  if (latitude != null) formData.append("latitude", latitude);
  if (longitude != null) formData.append("longitude", longitude);
  if (productVariantId != null)
    formData.append("product_variant_id", productVariantId);
  if (quantity != null) formData.append("quantity", quantity);
  if (storeId != null) formData.append("branch_id", storeId);
  if (cod != null) formData.append("cod", cod ? "1" : "0");
  const response = await api.post(apiEndPoints.checkServiceability, formData);
  return response.data;
};


export const getCountries = async ({ limit, offset, latitude, longitude }: any): Promise<any> => {
  const params = {
    limit,
    offset,
    latitude,
    longitude,
  };
  const response = await api.get(`${apiEndPoints.getShopByCountries}`, {
    params,
  });
  return response.data;
};
