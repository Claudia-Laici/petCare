import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export const useFetch = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!path) return;

    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(path, { signal: controller.signal });
        setData(result);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    return () => controller.abort();
  }, [path, reloadCount]);

  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  return { data, error, isLoading, refetch };
};