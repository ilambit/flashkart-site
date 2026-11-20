import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { setSelectedZone } from "@/redux/slices/locationModalSlice";
import * as api from "@/api/apiRoutes";

// Syncs zone from the URL into Redux and resolves full zone metadata.
const useZoneAdopt = () => {
  const params = useParams<{ zone?: string }>();
  const dispatch = useAppDispatch();
  const storedSlug = useAppSelector(
    (state) => state?.LocationModal?.selectedZone?.slug,
  );
  // Track URL zone being adopted to prevent re-entrancy.
  const adoptingRef = useRef<string | null>(null);

  useEffect(() => {
    const urlZone = params?.zone ?? null;
    // No zone in the URL: leave Redux alone. The user's stored pick must
    // survive a visit to /cart — unlike language, absence means "unknown here",
    // not "default".
    if (!urlZone || urlZone === storedSlug) return;
    if (adoptingRef.current === urlZone) return;
    adoptingRef.current = urlZone;

    // Defer adoption to avoid race condition with manual zone switches.
    let active = true;
    const timer = setTimeout(async () => {
      if (!active) return;
      if (process.env.NODE_ENV !== "production") {
      }
      // Seed placeholder slug and upgrade when resolved.
      dispatch(setSelectedZone({ id: null, name: null, slug: urlZone }));
      try {
        const zonesRes = await api.getZones();
        const zones = zonesRes?.data || [];
        const match = zones.find((z: any) => z?.slug === urlZone);
        if (!active || !match) return;
        if (process.env.NODE_ENV !== "production") {
        }
        dispatch(
          setSelectedZone({ id: match.id, name: match.name, slug: match.slug }),
        );
      } catch (err: any) {
        console.error("[useZoneAdopt]", err);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // storedSlug deliberately excluded: the placeholder dispatch inside this
    // effect writes storedSlug to urlZone before the full-object resolution
    // finishes — including storedSlug here would re-run this effect on that
    // write, tearing down (active=false) the in-flight getZones() call before
    // it can dispatch {id,name}. adoptingRef (not a dep) guards re-entry
    // instead, so this effect only re-runs on a REAL params.zone change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.zone, dispatch]);
};

export default useZoneAdopt;
