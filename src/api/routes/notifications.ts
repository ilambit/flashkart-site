"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getNotifications = async ({ limit = 7, offset = 0 }: any): Promise<any> => {
  const params = { limit, offset };
  const response = await api.get(`${apiEndPoints.getNotification}`, { params });
  return response.data;
};


export const getNotificationPreferences = async (): Promise<any> => {
  const response = await api.get(apiEndPoints.notificationPreferences);
  return response.data;
};


export const updateNotificationPreferences = async ({ preferences }: any): Promise<any> => {
  const response = await api.post(
    apiEndPoints.notificationPreferences,
    { preferences },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};
