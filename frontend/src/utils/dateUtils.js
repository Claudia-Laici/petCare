export const parseDate = (dateValue) => {
  if (!dateValue) return null;

  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const formatDate = (dateValue) => {
  const date = parseDate(dateValue);

  if (!date) return "Data non disponibile";

  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};