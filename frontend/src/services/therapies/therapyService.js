import { apiFetch } from "../../utils/apiFetch.js";

export const getTherapies = async (petId) => {
  const query = petId ? `?pet=${petId}` : "";

  return apiFetch(`/therapies${query}`);
};

export const createTherapy = async (data) => {
  return apiFetch("/therapies", {
    method: "POST",
    body: data,
  });
};

export const updateTherapy = async (therapyId, data) => {
  return apiFetch(`/therapies/${therapyId}`, {
    method: "PATCH",
    body: data,
  });
};

export const deleteTherapy = async (therapyId) => {
  return apiFetch(`/therapies/${therapyId}`, {
    method: "DELETE",
  });
};
