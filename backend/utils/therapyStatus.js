const toUtcDay = (value) => {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const getTherapyStatus = (therapy) => {
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const start = toUtcDay(therapy.startDate);
  const end = therapy.endDate ? toUtcDay(therapy.endDate) : null;

  if (start > today) return "scheduled";
  if (end !== null && end < today) return "ended";
  return "ongoing";
};
