import { apiFetch } from "../../utils/apiFetch";

export const updateUserAvatar = (formData) => {
  return apiFetch("/users/me/avatar", {
    method: "PATCH",
    body: formData,
  });
};
