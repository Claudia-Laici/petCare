export const getTherapyStatus = (therapy) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(therapy.startDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = therapy.endDate ? new Date(therapy.endDate) : null;

  if (endDate) {
    endDate.setHours(0, 0, 0, 0);
  }

  if (endDate && endDate < today) {
    return "ended";
  }

  if (startDate > today) {
    return "scheduled";
  }

  return "ongoing";
};
