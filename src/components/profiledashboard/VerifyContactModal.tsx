"use client";

import React, { useEffect, useRef, useState, ComponentType } from "react";
import OtpInput from "react-otp-input";
import { FiShield, FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/hooks";
import { t } from "@/utils/translation";
import * as api from "@/api/apiRoutes";
import { loadFirebaseAuth } from "@/utils/lazyFirebaseAuth";
import {
  getRecaptchaVerifier,
  clearRecaptchaVerifier,
} from "@/utils/recaptchaVerifier";
import { isIdentityNotVerified } from "@/utils/loginProof";

// Cast so OtpInput accepts className (forwarded at runtime, missing from types).
const OtpInputComponent = OtpInput as ComponentType<
  React.ComponentProps<typeof OtpInput> & { className?: string }
>;

const RECAPTCHA_ID = "profile-verify-recaptcha-container";

interface VerifyContactModalProps {
  type: "mobile" | "email" | null;
  email?: string;
  mobile?: string;
  countryCode?: string;
  onClose: () => void;
  onVerified: () => void;
  onUnavailable: (type: "mobile" | "email") => void;
}

// 429 is already toasted by the axios interceptor
const isRateLimited = (error: any) => error?.response?.status === 429;

const RESEND_SECONDS = 60;

// Retry-After is seconds or an HTTP date; falls back to 60s when absent/unexposed
const retryAfterMs = (error: any): number => {
  const raw = error?.response?.headers?.["retry-after"];
  const secs = Number(raw);
  if (raw && Number.isFinite(secs)) return Math.max(secs, 1) * 1000;
  const date = raw ? Date.parse(raw) : NaN;
  if (Number.isFinite(date)) return Math.max(date - Date.now(), 1000);
  return RESEND_SECONDS * 1000;
};

type Kind = "mobile" | "email";

const formatClock = (secs: number) =>
  `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

const VerifyContactModal = ({
  type,
  email,
  mobile,
  countryCode,
  onClose,
  onVerified,
  onUnavailable,
}: VerifyContactModalProps) => {
  const theme = useAppSelector((state) => state.Theme.theme);
  const setting = useAppSelector((state) => state?.Setting?.setting);
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const confirmationRef = useRef<any>(null);
  const autoSentRef = useRef(false);
  // Per-type timers survive close so reopening can't bypass them
  const [resendUntil, setResendUntil] = useState<Partial<Record<Kind, number>>>(
    {},
  );
  const [lockUntil, setLockUntil] = useState<Partial<Record<Kind, number>>>({});
  const lastSentRef = useRef<Partial<Record<Kind, string>>>({});
  const [now, setNow] = useState(() => Date.now());

  const open = type !== null;
  const dial = String(countryCode || "").replace(/^\+/, "");
  const fullPhone = `+${dial}${mobile || ""}`.replace(/\s+/g, "");
  const target = type === "email" ? email : fullPhone;
  const useFirebase = setting?.firebase_authentication == 1;
  // Hide until a code is sent so a 429/failure never shows a dead modal; Firebase recaptcha needs it mounted
  const visible = open && (codeSent || (type === "mobile" && useFirebase));

  const secsLeft = (until?: number) =>
    until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
  const resendLeft = type
    ? Math.max(secsLeft(resendUntil[type]), secsLeft(lockUntil[type]))
    : 0;
  const lockLeft = type ? secsLeft(lockUntil[type]) : 0;

  useEffect(() => {
    if (!open || resendLeft <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [open, resendLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const startLock = (error: any) => {
    if (!type) return;
    const until = Date.now() + retryAfterMs(error);
    setNow(Date.now());
    setLockUntil((prev) => ({ ...prev, [type]: until }));
  };

  const markSent = () => {
    if (!type) return;
    lastSentRef.current[type] = target;
    setNow(Date.now());
    setResendUntil((prev) => ({
      ...prev,
      [type]: Date.now() + RESEND_SECONDS * 1000,
    }));
    setCodeSent(true);
  };

  useEffect(() => {
    if (open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset flow when modal closes
    setOtp("");
    setCodeSent(false);
    autoSentRef.current = false;
    clearRecaptchaVerifier();
  }, [open]);

  const handleFailure = (res: any, fallback: string) => {
    const code = String(res?.status_code || "").toUpperCase();
    if (code.endsWith("_VERIFICATION_NOT_AVAILABLE") && type) {
      toast.error(res?.message || fallback);
      onUnavailable(type);
      onClose();
      return;
    }
    toast.error(
      isIdentityNotVerified(res)
        ? t("otp_invalid_or_expired")
        : res?.message || fallback,
    );
  };

  const sendCode = async (): Promise<boolean> => {
    if (
      isSending ||
      (type &&
        Math.max(resendUntil[type] || 0, lockUntil[type] || 0) > Date.now())
    )
      return false;
    setIsSending(true);
    let ok = false;
    try {
      if (type === "email") {
        const res = await api.sendEmailChangeCode({ email });
        if (res?.status == 1) {
          toast.success(res?.message || t("otp_sent_successfully"));
          markSent();
          ok = true;
        } else {
          handleFailure(res, t("otp_send_failed"));
        }
      } else if (useFirebase) {
        const verifier = await getRecaptchaVerifier(RECAPTCHA_ID);
        if (!verifier) throw new Error("recaptcha-unavailable");
        const { auth, signInWithPhoneNumber } = await loadFirebaseAuth();
        confirmationRef.current = await Promise.race([
          signInWithPhoneNumber(auth, fullPhone, verifier),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("otp-send-timeout")), 20000),
          ),
        ]);
        toast.success(t("otp_sent_successfully"));
        markSent();
        ok = true;
      } else if (setting?.custom_sms_gateway_otp_based == 1) {
        const res = await api.sendSms({ mobile: fullPhone });
        if (res?.status == 1) {
          toast.success(t("otp_sent_successfully"));
          markSent();
          ok = true;
        } else {
          toast.error(res?.message || t("custom_send_sms_error_message"));
        }
      } else {
        toast.error(t("Something went wrong"));
      }
    } catch (error) {
      console.error("[VerifyContactModal]", error);
      clearRecaptchaVerifier();
      if (isRateLimited(error)) startLock(error);
      else
        toast.error(
          (error as any)?.response?.data?.message || t("otp_send_failed"),
        );
    } finally {
      setIsSending(false);
    }
    return ok;
  };

  // Auto-send on open; defer so the recaptcha container is mounted in the portal
  useEffect(() => {
    if (!open || autoSentRef.current) return;
    autoSentRef.current = true;
    // Still cooling down: reuse the code already sent to this same target
    setNow(Date.now());
    const coolingDown =
      !!type &&
      Math.max(resendUntil[type] || 0, lockUntil[type] || 0) > Date.now();
    if (coolingDown) {
      if (type && lastSentRef.current[type] === target) {
        setCodeSent(true);
        return;
      }
      // No usable code for this target: don't open an empty modal
      toast.error(
        type && (lockUntil[type] || 0) > Date.now()
          ? "Too many attempts. Please wait a few minutes and try again."
          : `${t("resend_code_in")} ${formatClock(resendLeft)}`,
        { toastId: "rate-limited" },
      );
      onClose();
      return;
    }
    const id = setTimeout(async () => {
      if (!(await sendCode())) onClose();
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per open
  }, [open]);

  const verifyCode = async () => {
    if (!otp) {
      toast.error(t("otp_required"));
      return;
    }
    if (lockLeft > 0) return;
    setIsVerifying(true);
    try {
      let res;
      if (type === "email") {
        res = await api.verifyProfileEmail({ email, code: otp });
      } else if (useFirebase) {
        const cred = await confirmationRef.current?.confirm(otp);
        const firebaseIdToken = await cred?.user?.getIdToken();
        res = await api.verifyProfileMobile({
          mobile,
          countryCode: dial,
          firebaseIdToken,
        });
      } else {
        res = await api.verifyProfileMobile({ mobile, countryCode: dial, otp });
      }
      if (res?.status == 1) {
        toast.success(res?.message || t("verified"));
        onVerified();
        onClose();
      } else {
        handleFailure(res, t("otp_invalid_or_expired"));
      }
    } catch (error) {
      console.error("[VerifyContactModal]", error);
      if (isRateLimited(error)) startLock(error);
      else
        toast.error(
          (error as any)?.response?.data?.message ||
            t("otp_invalid_or_expired"),
        );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={(v) => !v && onClose()}>
      <DialogOverlay
        className={`${theme == "light" ? "bg-white/80" : "bg-black/80"}`}
      />
      <DialogContent
        className="max-w-md rounded-2xl p-0 overflow-hidden"
        title={type === "email" ? t("verify_email") : t("verify_mobile")}
      >
        <div className="flex items-start gap-3 px-6 py-5 bg-[color-mix(in_srgb,var(--primary-color,#29363f)_7%,transparent)]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg primaryColor bg-[color-mix(in_srgb,var(--primary-color,#29363f)_12%,transparent)]">
            <FiShield size={18} />
          </span>
          <div className="min-w-0 flex-grow">
            <h2 className="text-base font-bold textColor">
              {type === "email" ? t("verify_email") : t("verify_mobile")}
            </h2>
            <p
              className="text-xs subTextColor mt-0.5 truncate"
              dir={type === "mobile" ? "ltr" : undefined}
            >
              {target}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close") || "Close"}
            className="shrink-0 text-gray-400 hover:textColor transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm subTextColor">{t("enter_verification_code")}</p>
          <div dir="ltr" className="flex justify-center">
            <OtpInputComponent
              className="mx-auto items-center flex flex-wrap justify-center p-0"
              value={otp}
              onChange={(val: string) =>
                setOtp(val.replace(/\D/g, "").slice(0, 6))
              }
              numInputs={6}
              inputType="number"
              renderInput={(
                props: React.InputHTMLAttributes<HTMLInputElement>,
              ) => (
                <input
                  {...props}
                  aria-label={t("otp")}
                  className="cardBorder mx-1 rounded-lg bg-transparent textColor text-center p-2 w-10 md:w-12"
                  style={{ fontSize: "16px" }}
                />
              )}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => sendCode()}
              disabled={isSending || resendLeft > 0}
              className="text-sm font-semibold primaryColor disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSending && <FiLoader size={13} className="animate-spin" />}
              {resendLeft > 0 ? (
                <span dir="ltr" className="tabular-nums">
                  {t("resend_code_in")} {formatClock(resendLeft)}
                </span>
              ) : (
                t("resend_code")
              )}
            </button>
            <button
              type="button"
              onClick={verifyCode}
              disabled={
                !codeSent || isVerifying || lockLeft > 0 || otp.length < 6
              }
              className="px-6 py-2.5 primaryBackColor hover:opacity-90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying && <FiLoader size={15} className="animate-spin" />}
              {t("verify")}
            </button>
          </div>
          {type === "mobile" && useFirebase && (
            <div className="flex justify-center overflow-hidden">
              <div id={RECAPTCHA_ID} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyContactModal;
