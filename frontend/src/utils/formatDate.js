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

const isValidDate = (date) => {
  if (!date) return false;

  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime());
};

export const formatDate = (date) =>
  isValidDate(date) ? dateFormatter.format(new Date(date)) : "";

export const formatTime = (date) =>
  isValidDate(date) ? timeFormatter.format(new Date(date)) : "";

export const formatDateTime = (date) =>
  isValidDate(date) ? dateTimeFormatter.format(new Date(date)) : "";

export const toDateTimeLocal = (date) => {
  if (!isValidDate(date)) return "";

  const localDate = new Date(date);
  const offset = localDate.getTimezoneOffset() * 60000;

  return new Date(localDate.getTime() - offset).toISOString().slice(0, 16);
};