// Custom event for opening the global Login modal (owned by Header).
export const OPEN_LOGIN_EVENT = "login:open";

export const requestLogin = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT));
};
