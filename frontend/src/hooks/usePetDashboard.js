import { useState } from "react";
import { useFetch } from "./useFetch";
import { isTherapyOngoing } from "../utils/therapyStatus";
import { parseDate } from "../utils/dateUtils";

const isWithinNext30Days = (dateValue) => {
  if (!dateValue) return false;
  const date = parseDate(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(limit.getDate() + 30);

  return date && date >= today && date <= limit;
};

export const usePetDashboard = (pet) => {
  const petId = pet?._id;
  const isOwner = pet?.role === "owner";

  const [activeModal, setActiveModal] = useState(null);

  const {
    data: vaccinations,
    isLoading: vaccinationsLoading,
    refetch: refetchVaccinations,
  } = useFetch(petId ? `/vaccinations?pet=${petId}` : null);

  const {
    data: therapies,
    isLoading: therapiesLoading,
    refetch: refetchTherapies,
  } = useFetch(petId ? `/therapies?pet=${petId}` : null);

  const {
    data: documents,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useFetch(petId ? `/medical-documents?pet=${petId}` : null);

  const {
    data: shares,
    isLoading: sharesLoading,
    refetch: refetchShares,
  } = useFetch(petId && isOwner ? `/pets/${petId}/shares` : null);

  const petVaccinations = vaccinations ?? [];
  const petTherapies = therapies ?? [];
  const petDocuments = documents ?? [];
  const petShares = shares ?? [];

  const activeTherapies = petTherapies.filter(isTherapyOngoing);

  const upcomingTherapies = petTherapies.filter(
    (therapy) =>
      isTherapyOngoing(therapy) && isWithinNext30Days(therapy.nextReminderDate),
  );

  const upcomingVaccinations = petVaccinations.filter((vaccination) =>
    isWithinNext30Days(vaccination.nextDueDate),
  );

  return {
    petId,
    isOwner,
    petVaccinations,
    petTherapies,
    petDocuments,
    petShares,
    loading: {
      vaccinations: vaccinationsLoading,
      therapies: therapiesLoading,
      documents: documentsLoading,
      shares: sharesLoading,
    },
    counts: {
      vaccinations: petVaccinations.length,
      upcomingDeadlines: upcomingVaccinations.length + upcomingTherapies.length,
      activeTherapies: activeTherapies.length,
      documents: petDocuments.length,
      shares: petShares.length,
    },
    modals: {
      activeModal,
      open: (modalName) => setActiveModal(modalName),
      close: () => setActiveModal(null),
    },
    refetches: {
      vaccinations: refetchVaccinations,
      therapies: refetchTherapies,
      documents: refetchDocuments,
      shares: refetchShares,
    },
  };
};
