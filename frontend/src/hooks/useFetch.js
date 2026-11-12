import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch.js";

export const useFetch = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  const isLoading = Boolean(path) && data === null && error === null;

  useEffect(() => {
    if (!path) return;

    const controller = new AbortController();

    const load = async () => {
      setError(null);

      try {
        const result = await apiFetch(path, { signal: controller.signal });
        setData(result);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e);
      }
    };

    load();

    return () => controller.abort();
  }, [path, reloadCount]);

  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  return { data, error, isLoading, refetch };
};