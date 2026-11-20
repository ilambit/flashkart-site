import { cookies } from "next/headers";
import { cache } from "react";
import { getSettingServer, getCountrySettingServer } from "@/api/serverApi";
import { SSR_LOCATION_COOKIE, parseSsrLocation } from "@/utils/ssrLocationCookie";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// API sends JSON, older versions base64.
const unwrap = (res: any) => {
  try {
    return typeof res?.data === "string" ? JSON.parse(atob(res.data)) : res?.data;
  } catch {
    return null;
  }
};

const loadSettings = cache(async (lang: string) => {
  const raw = (await cookies()).get(SSR_LOCATION_COOKIE)?.value;
  const loc = parseSsrLocation(raw);
  const [setting, country] = await Promise.all([
    getSettingServer({ lang }).then(unwrap).catch(() => null),
    getCountrySettingServer({ ...(loc ?? {}), lang }).then(unwrap).catch(() => null),
  ]);
  return { setting, country };
});

/**
 * Unsanitized admin-authored HTML (About Us page-builder markup). Trusted-content
 * fields only — never use for anything a customer can submit.
 */
export const getCmsRawHtml = async ({
  lang,
  settingKey,
}: {
  lang: string;
  settingKey: string;
}): Promise<string> => {
  const { setting } = await loadSettings(lang);
  return setting?.[settingKey] || "";
};

/**
 * Sanitized CMS HTML for a page, on the server so sanitize-html stays out of
 * the client bundle. Country value wins over the global setting, as on the client.
 */
export const getCmsHtml = async ({
  lang,
  settingKey,
  countryKey,
}: {
  lang: string;
  settingKey: string;
  countryKey?: string;
}): Promise<string> => {
  const { setting, country } = await loadSettings(lang);
  const raw = (countryKey && country?.[countryKey]) || setting?.[settingKey] || "";
  return sanitizeHtml(raw).__html;
};
