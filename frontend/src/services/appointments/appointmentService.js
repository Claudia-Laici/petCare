import { apiFetch } from "../../utils/apiFetch";

export const getAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return apiFetch(
    `/appointments${query ? `?${query}` : ""}`,
  );
};

export const createAppointment = (data, idempotencyKey) => {
  return apiFetch("/appointments", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: data,
  });
};

export const updateAppointment = (appointmentId, data) => {
  return apiFetch(`/appointments/${appointmentId}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteAppointment = (appointmentId) => {
  return apiFetch(`/appointments/${appointmentId}`, {
    method: "DELETE",
  });
};

export const createAppointmentShare = (appointmentId, data) => {
  return apiFetch(`/appointments/${appointmentId}/shares`, {
    method: "POST",
    body: data,
  });
};

export const getAppointmentShares = (appointmentId) => {
  return apiFetch(`/appointments/${appointmentId}/shares`);
};

export const revokeAppointmentShare = (appointmentId, shareId) => {
  return apiFetch(`/appointments/${appointmentId}/shares/${shareId}`, {
    method: "DELETE",
  });
};