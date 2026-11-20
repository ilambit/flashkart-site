"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const startAdminChat = async (): Promise<any> => {
  const response = await api.post(apiEndPoints.chatStartAdmin);
  return response.data;
};


export const startOrderChat = async ({ order_id, order_item_id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_id", order_id);
  if (order_item_id != null && order_item_id !== "") {
    formData.append("order_item_id", order_item_id);
  }
  const response = await api.post(apiEndPoints.chatStartOrder, formData);
  return response.data;
};


export const startOrderAdminChat = async ({ order_id }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("order_id", order_id);
  const response = await api.post(apiEndPoints.chatStartOrderAdmin, formData);
  return response.data;
};


export const getChatMessages = async ({ conversation_id }: any): Promise<any> => {
  const response = await api.get(apiEndPoints.chatMessages, {
    params: { conversation_id },
  });
  return response.data;
};


export const sendChatMessage = async ({
  conversation_id,
  message,
  images,
  audios,
  videos,
  files,
  latitude,
  longitude,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("conversation_id", conversation_id);
  if (message) formData.append("message", message);
  if (latitude != null) formData.append("latitude", latitude);
  if (longitude != null) formData.append("longitude", longitude);
  const appendAll = (field, list) =>
    (list || []).forEach((file) => file && formData.append(field, file));
  appendAll("images[]", images);
  appendAll("audios[]", audios);
  appendAll("videos[]", videos);
  appendAll("files[]", files);
  const response = await api.post(apiEndPoints.chatSend, formData);
  return response.data;
};
