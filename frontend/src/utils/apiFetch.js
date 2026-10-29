const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem("token");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiFetch = async (path, options = {}) => {
  const { body, headers, ...rest } = options;
  const token = getToken();
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body && !isFormData ? JSON.stringify(body) : body,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && token && path !== "/auth/login") {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new ApiError("Sessione scaduta", 401);
  }

  if (!response.ok) {
    throw new ApiError(data?.message || "Errore di rete", response.status);
  }

  return data;
};
