import { useAppSelector } from "@/redux/hooks";
import useIsHydrated from "./useIsHydrated";

/** Hydration-safe hook checking if active language direction is RTL. */
const useIsRtl = (): boolean => {
  const type = useAppSelector(
    (state) => state.Language?.selectedLanguage?.type,
  );
  const hydrated = useIsHydrated();
  return hydrated && type === "RTL";
};

export default useIsRtl;

