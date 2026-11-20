import { store } from "@/redux/store";
import { t } from "@/utils/translation";

const NOTE_ID = "unsupported-browser-note";
export const HIDE_NOTE_KEY = "hide-unsupported-browser-note";

const isHidden = (): boolean => {
  try {
    return sessionStorage.getItem(HIDE_NOTE_KEY) === "true";
  } catch {
    return false;
  }
};

export const createStickyNote = (): void => {
  if (typeof window === "undefined" || isHidden()) return;
  if (document.getElementById(NOTE_ID)) return;

  const state = store.getState() as any;
  const appUrl = state?.Setting?.setting?.web_settings?.ios_app_url;
  const isLight = state?.Theme?.theme === "light";

  const note = document.createElement("div");
  note.id = NOTE_ID;
  note.setAttribute("role", "status");
  Object.assign(note.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    backgroundColor: isLight ? "#ffffff" : "#40454A",
    color: isLight ? "#40454A" : "#fff",
    padding: "15px",
    textAlign: "center",
    fontSize: "14px",
    zIndex: "99999",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  const text = document.createElement("span");
  text.textContent = t("chat_and_notification_not_supported");
  note.appendChild(text);

  if (appUrl) {
    const link = document.createElement("a");
    link.textContent = t("download_now");
    link.href = appUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    Object.assign(link.style, {
      textDecoration: "underline",
      color: "#3498db",
      marginLeft: "10px",
    });
    note.appendChild(link);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";
  Object.assign(close.style, {
    cursor: "pointer",
    marginLeft: "20px",
    fontSize: "20px",
    lineHeight: "1",
    background: "none",
    border: "none",
    color: "inherit",
  });
  close.onclick = () => {
    note.remove();
    try {
      sessionStorage.setItem(HIDE_NOTE_KEY, "true");
    } catch {}
  };
  note.appendChild(close);

  document.body.appendChild(note);
};
