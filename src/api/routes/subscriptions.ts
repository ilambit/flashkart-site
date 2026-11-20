"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getSubscriptionPlans = async (): Promise<any> => {
  const response = await api.get(`${apiEndPoints.subscriptionPlans}`);
  return response.data;
};

export const getUserActivePlan = async (): Promise<any> => {
  const response = await api.get(`${apiEndPoints.userActivePlan}`);
  return response.data;
};

export const getSubscriptionFaqs = async ({ offset, limit }: any = {}): Promise<any> => {
  const params = {
    offset,
    limit,
  };
  const response = await api.get(`${apiEndPoints.subscriptionFaqs}`, { params });
  return response.data;
};
