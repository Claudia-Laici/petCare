import { useFetch } from "./useFetch";

export const useVaccinations = () => {
  const {
    data: vaccinations,
    isLoading,
    error,
    refetch,
  } = useFetch("/vaccinations");

  return {
    vaccinations,
    isLoading,
    error,
    refetch,
  };
};