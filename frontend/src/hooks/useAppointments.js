import { useCallback, useEffect, useState } from "react";
import { getAppointments } from "../services/appointments/appointmentService";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  const refetch = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAppointments();

        if (isActive) {
          setAppointments(data);
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

    loadAppointments();

    return () => {
      isActive = false;
    };
  }, [reloadCount]);

  return {
    appointments,
    isLoading,
    error,
    refetch,
    setAppointments,
  };
};