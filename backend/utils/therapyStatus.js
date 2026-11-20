const toLocalDay = (value) => {
  const date = new Date(value);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
};

export const getTherapyStatus = (therapy) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();
  const start = toLocalDay(therapy.startDate);
  const end = therapy.endDate ? toLocalDay(therapy.endDate) : null;

  if (start > todayTime) return "scheduled";
  if (end !== null && end < todayTime) return "ended";

  return "ongoing";
};
