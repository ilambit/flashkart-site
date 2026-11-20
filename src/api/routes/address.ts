"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getAddress = async (): Promise<any> => {
  const response = await api.get(`${apiEndPoints.getAddress}`);
  return response.data;
};


export const addAddress = async ({
  name,
  mobile,
  country_code = "",
  alternate_country_code = "",
  type,
  address,
  landmark,
  area,
  pincode,
  city,
  state,
  country,
  region_id,
  latitiude,
  longitude,
  is_default = 1,
  alternate_mobile = "",
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("mobile", mobile);
  formData.append("country_code", country_code);
  // Optional alt contact: omit both fields entirely when no number given.
  if (String(alternate_mobile ?? "").trim())
    formData.append("alternate_country_code", alternate_country_code);
  formData.append("type", type);
  formData.append("address", address);
  formData.append("landmark", landmark);
  formData.append("area", area);
  formData.append("pincode", pincode);
  formData.append("city", city);
  formData.append("state", state);
  formData.append("country", country);
  if (region_id != null) formData.append("region_id", region_id);
  if (String(alternate_mobile ?? "").trim())
    formData.append("alternate_mobile", alternate_mobile);
  formData.append("latitude", latitiude);
  formData.append("longitude", longitude);
  formData.append("is_default", (is_default ? 1 : 0) as any);
  const response = await api.post(
    `${apiEndPoints.getAddress}/${apiEndPoints.add}`,
    formData
  );
  return response.data;
};

export const updateAddress = async ({
  id,
  name,
  mobile,
  country_code = "",
  alternate_country_code = "",
  type,
  address,
  landmark,
  area,
  pincode,
  city,
  state,
  country,
  region_id,
  latitiude,
  longitude,
  is_default = 1,
  alternate_mobile = "",
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("name", name);
  formData.append("mobile", mobile);
  formData.append("country_code", country_code);
  // Alt contact is editable: always send, empty clears a saved number.
  const altMobile = String(alternate_mobile ?? "").trim();
  formData.append("alternate_country_code", altMobile ? alternate_country_code : "");
  formData.append("type", type);
  formData.append("address", address);
  formData.append("landmark", landmark);
  formData.append("area", area);
  formData.append("pincode", pincode);
  formData.append("city", city);
  formData.append("state", state);
  formData.append("country", country);
  if (region_id != null) formData.append("region_id", region_id);
  formData.append("alternate_mobile", altMobile);
  formData.append("latitude", latitiude);
  formData.append("longitude", longitude);
  formData.append("is_default", (is_default ? 1 : 0) as any);
  const response = await api.post(
    `${apiEndPoints.getAddress}/${apiEndPoints.update}`,
    formData
  );
  return response.data;
};

export const deleteAddress = async ({ id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("id", id);
  const response = await api.post(
    `${apiEndPoints.getAddress}/${apiEndPoints.deleteItem}`,
    formData
  );
  return response.data;
};
