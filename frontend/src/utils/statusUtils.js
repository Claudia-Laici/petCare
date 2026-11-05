import { useMemo } from "react";

export const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const sortByStatus = (items, getStatus, getSortTime, direction = "asc") => {
  const sign = direction === "desc" ? -1 : 1;

  return items
    .map((item) => ({
      ...item,
      status: getStatus(item),
      sortTime: getSortTime(item),
    }))
    .sort((a, b) => {
      if (a.status.priority !== b.status.priority) {
        return a.status.priority - b.status.priority;
      }
      return sign * (a.sortTime - b.sortTime);
    });
};

export const useSortedByStatus = (items, getStatus, getSortTime, direction) =>
  useMemo(
    () => sortByStatus(items, getStatus, getSortTime, direction),
    [items, getStatus, getSortTime, direction],
  );