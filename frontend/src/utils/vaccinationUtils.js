import { parseDate } from "./dateUtils";
import { startOfToday } from "./statusUtils";

const DAY = 1000 * 60 * 60 * 24;

export const VACCINATION_STATUS = {
  expiring: {
    label: "In scadenza",
    variant: "warning",
    priority: 0,
  },
  toAdminister: {
    label: "Da effettuare",
    variant: "info",
    priority: 1,
  },
  expired: {
    label: "Scaduto",
    variant: "danger",
    priority: 2,
  },
  upToDate: {
    label: "In regola",
    variant: "info",
    priority: 3,
  },
  single: {
    label: "Unica somministrazione",
    variant: "success",
    priority: 4,
  },
  toDefine: {
    label: "Richiamo da definire",
    variant: "secondary",
    priority: 5,
  },
};

export const getVaccinationState = (vaccination) => {
  const today = startOfToday();

  const administered = parseDate(vaccination.dateAdministered);

  if (administered && administered > today) return "toAdminister";

  if (vaccination.isSingleDose) return "single";

  const dueDate = parseDate(vaccination.nextDueDate);

  if (!dueDate) return "toDefine";

  const daysRemaining = Math.round((dueDate - today) / DAY);

  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 30) return "expiring";

  return "upToDate";
};

export const getVaccinationStatus = (vaccination) =>
  VACCINATION_STATUS[getVaccinationState(vaccination)];

export const getVaccinationSortTime = (vaccination) =>
  parseDate(
    vaccination.nextDueDate || vaccination.dateAdministered,
  )?.getTime() ?? 0;