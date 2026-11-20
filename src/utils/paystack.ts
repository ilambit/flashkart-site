// Paystack's SDK touches `window` at import and weighs ~42KB gzipped, so it is
// fetched only once Paystack is picked. One cached promise = one init, no
// matter how many callers (prefetch on select + the pay handler) ask for it.
let paystackPromise: Promise<any> | null = null;

export const loadPaystack = (): Promise<any> => {
  if (!paystackPromise) {
    paystackPromise = import("@paystack/inline-js")
      .then((module) => module.default)
      .catch((error) => {
        // Allow a retry if the chunk failed to load (offline, deploy swap).
        paystackPromise = null;
        throw error;
      });
  }
  return paystackPromise;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Paystack rejects setup() without an email; phone-login users have none.
export const getPaystackEmail = (
  user: any,
  supportEmail?: string,
): string => {
  const email = typeof user?.email === "string" ? user.email.trim() : "";
  if (EMAIL_RE.test(email)) return email;
  const local = String(user?.mobile || user?.id || "customer").replace(/[^\w.-]/g, "");
  const supportDomain = String(supportEmail || "").split("@")[1];
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const domain = supportDomain || (host.includes(".") ? host : "example.com");
  return `${local}@${domain}`;
};

// Backend 1.6.0 rejects any reference not shaped order-{orderId}-{userId}-* / wallet-{userId}-*.
export const paystackOrderRef = (orderId: number | string, userId: number | string) =>
  `order-${orderId}-${userId}-${Date.now()}`;

export const paystackWalletRef = (userId: number | string) =>
  `wallet-${userId}-${Date.now()}`;
