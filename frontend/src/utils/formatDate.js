const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
});

export const formatDate = (date) =>
  date ? dateFormatter.format(new Date(date)) : "";

export const formatTime = (date) =>
  date ? timeFormatter.format(new Date(date)) : "";

export const formatDateTime = (date) =>
  date ? dateTimeFormatter.format(new Date(date)) : "";

export const toDateTimeLocal = (date) => {
  if (!date) return "";

  const localDate = new Date(date);
  const offset = localDate.getTimezoneOffset() * 60000;

  return new Date(localDate.getTime() - offset).toISOString().slice(0, 16);
};