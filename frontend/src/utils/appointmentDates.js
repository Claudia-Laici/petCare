export const getAppointmentDate = (appointment) => new Date(appointment.startAt);

export const hasValidDate = (appointment) =>
  !Number.isNaN(getAppointmentDate(appointment).getTime());

export const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const upcomingLabel = (date) => {
  const diff = Math.round(
    (startOfDay(date) - startOfDay(new Date())) / 86400000,
  );

  if (diff === 0) return "Oggi";
  if (diff === 1) return "Domani";
  if (diff <= 7) return "Nei prossimi giorni";
  return "Più avanti";
};

export const pastLabel = (date) =>
  date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

export const groupByLabel = (items, getLabel) =>
  items.reduce((groups, item) => {
    const label = getLabel(item);
    const last = groups[groups.length - 1];

    if (last?.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }

    return groups;
  }, []);