"use client";

import { useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";
import { setLanguageCodes } from "@/redux/slices/languageSlice";

// Seeds Redux language codes from the page's SSR data, so zoneHref can tell a
// language ("fr") from a zone ("bhuj-quick") before the client fetch lands.
// Rendered per page — the root layout has no per-route props.
export default function LanguageCodesSeed({ codes }: { codes?: string[] | null }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Array.isArray(codes) && codes.length) {
      dispatch(setLanguageCodes(codes));
    }
  }, [codes, dispatch]);

  return null;
}
