import { useCallback, useState } from "react";
import { toast } from "sonner";
import { demoUserLocation } from "@/services/providers/demo/demoData";
import type { LatLng } from "@/types";

interface GeolocationState {
  location: LatLng;
  isLocating: boolean;
  isPrecise: boolean;
}

/**
 * Browser Geolocation with a graceful fallback: if the user declines, the app
 * keeps working from the demo city centre and says so kindly.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: demoUserLocation,
    isLocating: false,
    isPrecise: false,
  });

  const locate = useCallback(
    (onLocated?: (location: LatLng) => void) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        toast.info("Localização indisponível", {
          description: "Seu navegador não oferece geolocalização.",
        });
        onLocated?.(state.location);
        return;
      }

      setState((prev) => ({ ...prev, isLocating: true }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({ location, isLocating: false, isPrecise: true });
          onLocated?.(location);
        },
        (error) => {
          setState((prev) => ({ ...prev, isLocating: false }));
          const denied = error.code === error.PERMISSION_DENIED;
          toast.info(denied ? "Localização bloqueada" : "Não foi possível localizar", {
            description: denied
              ? "Ative a permissão de localização para centralizar o mapa em você."
              : "Usando o centro da cidade por enquanto.",
          });
          onLocated?.(state.location);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
      );
    },
    [state.location],
  );

  return { ...state, locate };
}
