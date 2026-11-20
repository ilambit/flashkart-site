export interface LoginProof {
  firebaseIdToken?: string;
  otp?: string;
  phoneVerificationToken?: string;
}

// verify_user consumes the SMS code; register must reuse its token instead.
export const getPhoneVerificationToken = (res: any): string | undefined =>
  res?.data?.phone_verification_token || res?.phone_verification_token || undefined;

export const isIdentityNotVerified = (res: any): boolean =>
  String(res?.status_code || res?.message || "").toUpperCase() === "IDENTITY_NOT_VERIFIED";

// Proof from the last verified sign-in, reused if it continues into signup.
let proof: LoginProof = {};

export const setLoginProof = (next: LoginProof) => {
  proof = { ...next };
};

export const getLoginProof = (): LoginProof => proof;

export const clearLoginProof = () => {
  proof = {};
};
