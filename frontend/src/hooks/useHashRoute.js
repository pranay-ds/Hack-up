import { useState, useEffect, useCallback } from "react";

export function useHashRoute() {
  const [route, setRouteState] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "dashboard";
  });

  const setRoute = useCallback((r) => {
    window.location.hash = r;
    setRouteState(r);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace("#", "");
      setRouteState(hash || "dashboard");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return { route, setRoute };
}
