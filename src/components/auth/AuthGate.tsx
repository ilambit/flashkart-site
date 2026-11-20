"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader/Loader";
import useZoneHref from "@/hooks/useZoneHref";

/**
 * Client-only route guard (no server-side session check).
 * - requireAuth: redirect to `redirectTo` unless user.jwtToken.
 * - requireResetEligible: redirect to /profile unless email auth, or phone
 *   auth with phone_auth_password enabled.
 */
export default function AuthGate({
  children,
  requireAuth = false,
  requireSubscription = false,
  requireResetEligible = false,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  requireResetEligible?: boolean;
  redirectTo?: string;
}) {
  const zoneHref = useZoneHref();
  const router = useRouter();
  const user = useAppSelector((state) => state.User);
  const authType = useAppSelector((state) => state.User.authType);
  const setting = useAppSelector((state) => state?.Setting?.setting);
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (requireAuth && !user?.jwtToken) {
      router.push(zoneHref(redirectTo));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }
    if (requireSubscription && !user?.user?.is_subscription_plans) {
      router.push(zoneHref(redirectTo));
      setChecked(true);
      return;
    }
    if (
      requireResetEligible &&
      !(
        authType == "email" ||
        (authType == "phone" && setting?.phone_auth_password == 1)
      )
    ) {
      router.push(zoneHref("/profile"));
      setChecked(true);
      return;
    }
    setOk(true);
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authType, setting, requireAuth, requireResetEligible, redirectTo]);

  // Reset-password-only check renders nothing while checking (no loader flash).
  if (!checked) {
    return requireResetEligible && !requireAuth ? null : (
      <Loader screen="full" />
    );
  }

  return ok ? <>{children}</> : null;
}
