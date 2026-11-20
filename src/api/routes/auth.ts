"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const registerUser = async ({
  name,
  email,
  mobile,
  type,
  fcm,
  country_code,
  country_id,
  password,
  phoneAuthType = false,
  friend_code,
  firebaseIdToken,
  otp,
  phoneVerificationToken,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("name", name);
  if (firebaseIdToken) formData.append("firebase_id_token", firebaseIdToken);
  if (phoneVerificationToken) {
    formData.append("phone_verification_token", phoneVerificationToken);
  } else if (otp) {
    formData.append("otp", otp);
  }
  formData.append("country_code", country_code);
  if (country_id !== null && country_id !== undefined && country_id !== "") {
    formData.append("country_id", country_id);
  }
  formData.append("type", type);
  formData.append("fcm_token", fcm);
  formData.append("platform", "web");
  if (type == "email" || (type == "phone" && phoneAuthType)) {
    formData.append("password", password);
  }
  if (
    type === "phone" ||
    ((type === "email" || type === "google") &&
      mobile !== null &&
      mobile !== "")
  ) {
    formData.append("mobile", mobile);
  }
  if (type === "email" || type === "google" || (type === "phone" && email)) {
    formData.append("email", email);
  }
  if (friend_code !== null) {
    formData.append("friends_code", friend_code);
  }
  const response = await api.post(apiEndPoints.register, formData);
  return response.data;
};

export const login = async ({
  id,
  fcm,
  type,
  password,
  phoneAuthType,
  country_code,
  firebaseIdToken,
  otp,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("id", id);
  if (firebaseIdToken) formData.append("firebase_id_token", firebaseIdToken);
  if (otp) formData.append("otp", otp);
  formData.append("fcm_token", fcm);
  formData.append("type", type);
  formData.append("platform", "web");
  if (type == "phone") {
    formData.append("country_code", country_code || "");
    formData.append(
      "phone_auth_type",
      phoneAuthType ? "phone_auth_password" : "phone_auth_otp",
    );
  }
  if (type == "email" || (type == "phone" && phoneAuthType)) {
    formData.append("password", password);
  }
  const response = await api.post(apiEndPoints.login, formData);
  return response.data;
};

export const sendSms = async ({ mobile }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("phone", mobile);
  const response = await api.post(apiEndPoints.sendSms, formData);
  return response.data;
};

export const verifyOTP = async ({
  mobile,
  otp,
  country_code,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("phone", mobile);
  formData.append("otp", otp);
  formData.append("country_code", country_code);
  const response = await api.post(apiEndPoints.verifyContact, formData);
  return response.data;
};

export const verifyEmail = async ({
  email,
  code,
  password,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("code", code);
  if (password) formData.append("password", password);
  const response = await api.post(apiEndPoints.verifyEmail, formData);
  return response.data;
};

export const forgotPasswordOTP = async ({ email }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("email", email);
  const response = await api.post(apiEndPoints.forgotPasswordOtp, formData);
  return response.data;
};

export const forgotPassword = async ({
  phone,
  otp,
  email,
  password,
  confirmPassword,
  type,
  otpMethod,
  firebaseIdToken,
}: any): Promise<any> => {
  const formData = new FormData();
  if (type == "phone" && otpMethod == "firebase") {
    formData.append("firebase_id_token", firebaseIdToken ?? "");
  }
  if (
    type == "email" ||
    (type == "phone" && (otpMethod == "twilio" || otpMethod == "firebase"))
  ) {
    formData.append("otp", otp ?? "");
  }
  if (type == "email") {
    formData.append("email", email);
  }
  if (type == "phone") {
    formData.append("mobile", phone);
  }
  formData.append("password", password);
  formData.append("password_confirmation", confirmPassword);
  formData.append("type", type);
  if (type == "phone") {
    formData.append("otp_verify_method", otpMethod);
  }
  const response = await api.post(apiEndPoints.forgotPassword, formData);
  return response.data;
};

export const resetPassword = async ({
  password,
  newPassword,
  confirmPassword,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("old_password", password);
  formData.append("new_password", newPassword);
  formData.append("new_password_confirmation", confirmPassword);
  const response = await api.post(apiEndPoints.resetPassword, formData);
  return response.data;
};

export const updateProfile = async ({
  image,
  name,
  email,
  mobileNumber,
  countryCode,
  countryId,
  type,
  latitude,
  longitude,
}: any): Promise<any> => {
  const formData = new FormData();
  if (image) formData.append("profile", image);
  formData.append("name", name ?? "");
  // Email is optional for phone-auth accounts. An undefined/null value would
  // stringify to the literal "undefined"/"null" in FormData, so send empty.
  formData.append("email", email ?? "");
  if (countryId !== null && countryId !== undefined && countryId !== "") {
    formData.append("country_id", countryId);
  }
  // Empty mobile clears it server-side (1.6.0 edit_profile)
  formData.append("mobile", mobileNumber ?? "");
  if (mobileNumber && countryCode) formData.append("country_code", countryCode);
  if (latitude) formData.append("latitude", latitude);
  if (longitude) formData.append("longitude", longitude);
  const response = await api.post(apiEndPoints.editProfile, formData);
  return response.data;
};

export const getUser = async ({
  latitude,
  longitude,
}: any = {}): Promise<any> => {
  const params: Record<string, any> = {};
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;
  const response = await api.get(apiEndPoints.getUser, { params });
  return response.data;
};

export const logout = async ({ fcm }: any = {}): Promise<any> => {
  const formData = new FormData();
  if (fcm) {
    formData.append("fcm_token", fcm);
    formData.append("platform", "web");
  }
  const response = await api.post(`${apiEndPoints.logout}`, formData);
  return response.data;
};

export const deleteUser = async ({ uid = null }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("auth_uid", uid);
  const response = await api.post(apiEndPoints.deleteAccount, formData);
  return response.data;
};

export const verifyUserByPhoneNum = async ({
  mobile,
  countryCode,
  type,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("mobile", mobile);
  formData.append("country_code", countryCode);
  formData.append("type", type);
  const response = await api.post(
    `${apiEndPoints.verifyUserByPhoneNum}`,
    formData,
  );
  return response.data;
};

export const verifyProfileMobile = async ({
  mobile,
  countryCode,
  firebaseIdToken,
  otp,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("mobile", mobile ?? "");
  // Spec wants "+91" form
  const dial = String(countryCode ?? "").replace(/^\+/, "");
  formData.append("country_code", dial ? `+${dial}` : "");
  if (firebaseIdToken) formData.append("firebase_id_token", firebaseIdToken);
  else if (otp) formData.append("otp", otp);
  const response = await api.post(apiEndPoints.verifyProfileMobile, formData);
  return response.data;
};

export const sendEmailChangeCode = async ({ email }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("email", email ?? "");
  const response = await api.post(apiEndPoints.sendEmailChangeCode, formData);
  return response.data;
};

export const verifyProfileEmail = async ({
  email,
  code,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("email", email ?? "");
  formData.append("email_code", code ?? "");
  const response = await api.post(apiEndPoints.verifyProfileEmail, formData);
  return response.data;
};
