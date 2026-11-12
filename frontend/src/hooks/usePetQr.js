import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";

export const usePetQr = (petId) => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!petId) return;
    try {
      setQr(await apiFetch(`/pets/${petId}/qr`));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    load();
  }, [load]);

  const enable = async () => {
    await apiFetch(`/pets/${petId}/qr`, { method: "POST" });
    setLoading(true);
    await load();
  };

  const regenerate = async () => {
    await apiFetch(`/pets/${petId}/qr/regenerate`, { method: "POST" });
    setLoading(true);
    await load();
  };

  const updateSettings = async (settings) => {
    await apiFetch(`/pets/${petId}/qr/settings`, {
      method: "PATCH",
      body: settings,
    });

    await load();
  };

  return { qr, loading, enable, regenerate, updateSettings };
};
