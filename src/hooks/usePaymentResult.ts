"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as api from "@/api/apiRoutes";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/slices/userSlice";
import useZoneHref from "@/hooks/useZoneHref";
import { t } from "@/utils/translation";

const PROCESSING_REFRESH_MS = 3000;

const resultCode = (res: any): string =>
  String(res?.status_code || res?.message || "").trim().toUpperCase();

export const isCartBranchChanged = (res: any): boolean =>
  resultCode(res) === "CART_BRANCH_CHANGED";

// Backend 1.6.0 payment outcomes that are neither success nor a retryable failure.
const usePaymentResult = () => {
  const router = useRouter();
  const zoneHref = useZoneHref();
  const dispatch = useAppDispatch();

  const refreshBalance = async () => {
    try {
      const res = await api.getUser();
      if (res?.data) dispatch(setCurrentUser({ data: res.data }));
    } catch (error) {
      console.error("[usePaymentResult]", error);
    }
  };

  // Returns true when the response was handled; caller must not delete the order or re-ask payment.
  const handlePaymentResult = (
    res: any,
    { orderId, method }: { orderId?: number | string | null; method?: string } = {},
  ): boolean => {
    const code = resultCode(res);
    if (code === "PAYMENT_PROCESSING") {
      toast.info(t("payment_processing") || res?.message || "Payment is processing");
      setTimeout(() => {
        router.push(
          zoneHref(
            `/web-payment-status?status=pending&type=order${
              method ? `&payment_method=${method}` : ""
            }${orderId ? `&order_id=${orderId}` : ""}`,
          ),
        );
      }, PROCESSING_REFRESH_MS);
      return true;
    }
    if (code === "PAYMENT_TO_WALLET") {
      toast.info(res?.message || t("payment_to_wallet"));
      refreshBalance();
      return true;
    }
    return false;
  };

  return { handlePaymentResult, refreshBalance };
};

export default usePaymentResult;
