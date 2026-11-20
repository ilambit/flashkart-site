"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getSpinWheel = async ({ latitude, longitude }: any = {}): Promise<any> => {
  const params: Record<string, any> = {};
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  const response = await api.get(apiEndPoints.spinWheel, { params });
  return response.data;
};


export const spinSpinWheel = async ({
  latitude,
  longitude,
  idempotencyKey,
}: any = {}): Promise<any> => {
  const formData = new FormData();
  if (latitude != null) formData.append("latitude", latitude);
  if (longitude != null) formData.append("longitude", longitude);
  if (idempotencyKey) formData.append("request_token", idempotencyKey);
  const response = await api.post(apiEndPoints.spinWheelSpin, formData);
  return response.data;
};


export const getSpinWheelRewards = async ({
  latitude,
  longitude,
  rewardType,
  limit,
  offset,
}: any = {}): Promise<any> => {
  const params: Record<string, any> = {};
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  if (rewardType) params.reward_type = rewardType;
  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  const response = await api.get(apiEndPoints.spinWheelRewards, { params });
  return response.data;
};
