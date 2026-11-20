import { useCallback, useEffect, useState } from "react";
import { getTherapies } from "../services/therapies/therapyService";

export const useTherapies = (petId) => {
  const [therapies, setTherapies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  const refetch = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadTherapies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getTherapies(petId);

        if (isActive) {
          setTherapies(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadTherapies();

    return () => {
      isActive = false;
    };
  }, [petId, reloadCount]);

  return {
    therapies,
    isLoading,
    error,
    refetch,
    setTherapies,
  };
};