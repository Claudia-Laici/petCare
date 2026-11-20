import { parseDate } from "./dateUtils";
import { startOfToday } from "./statusUtils";

export const THERAPY_STATUS = {
  ongoing: {
    label: "In corso",
    variant: "success",
    priority: 0,
  },
  scheduled: {
    label: "Programmato",
    variant: "info",
    priority: 1,
  },
  ended: {
    label: "Terminato",
    variant: "secondary",
    priority: 2,
  },
  unknown: {
    label: "Stato non disponibile",
    variant: "secondary",
    priority: 3,
  },
};

export const getTherapyStatus = (therapy) => {
  const today = startOfToday();

  const startDate = parseDate(therapy.startDate);
  const endDate = parseDate(therapy.endDate);

  if (!startDate) return THERAPY_STATUS.unknown;

  if (startDate > today) return THERAPY_STATUS.scheduled;
  if (endDate && endDate < today) return THERAPY_STATUS.ended;

  return THERAPY_STATUS.ongoing;
};

export const getTherapyStatusKey = (therapy) => {
  const today = startOfToday();

  const startDate = parseDate(therapy.startDate);
  const endDate = parseDate(therapy.endDate);

  if (!startDate) return "unknown";
  if (startDate > today) return "scheduled";
  if (endDate && endDate < today) return "ended";

  return "ongoing";
};

export const getTherapySortTime = (therapy) =>
  parseDate(therapy.startDate)?.getTime() ?? 0;

export const isTherapyOngoing = (therapy) =>
  therapy.status === "ongoing";
