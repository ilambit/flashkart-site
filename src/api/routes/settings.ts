"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getSetting = async (): Promise<any> => {
  const params = {
    is_web_setting: 1,
  };
  const response = await api.get(apiEndPoints.getSettings, { params });
  return response.data;
};


export const getCountrySetting = async ({ latitude, longitude }: any = {}): Promise<any> => {
  const params: Record<string, any> = {};
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;
  const response = await api.get(apiEndPoints.getCountrySetting, { params });
  return response.data;
};


export const getPaymentSetting = async ({ latitude, longitude }: any = {}): Promise<any> => {
  const response = await api.get(
    `${apiEndPoints.getSettings}/${apiEndPoints.getPaymentMethods}`,
    { params: { latitude, longitude } }
  );
  return response.data;
};


export const getSystemLanguages = async ({ id, isDefault, systemType }: any): Promise<any> => {
  const params = { id: id, is_default: isDefault, system_type: systemType };
  const response = await api.get(apiEndPoints.getSystemLanguage, { params });
  return response.data;
};


export const updateFcmToken = async ({ langaugeId, fcmToken }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("language_id", langaugeId);
  formData.append("fcm_token", fcmToken);
  const response = await api.post(apiEndPoints.updateFcmToken, formData);
  return response.data;
};


export const getFAQs = async ({ limit = 7, offset = 0 }: any): Promise<any> => {
  const params = { limit, offset };
  const response = await api.get(`${apiEndPoints.getFaq}`, { params });
  return response.data;
};
