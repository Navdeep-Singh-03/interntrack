// Vercel supplies VITE_API_BASE_URL during deployment.
// The local value keeps development working without extra setup.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("interntrack_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || "Request failed. Please try again.");
  return data;
}

export const register = (details) => request("/auth/register", { method: "POST", body: JSON.stringify(details) });
export const login = (details) => request("/auth/login", { method: "POST", body: JSON.stringify(details) });
export const getApplications = (search, status) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status_filter", status);
  return request(`/applications?${params.toString()}`);
};
export const createApplication = (application) => request("/applications", { method: "POST", body: JSON.stringify(application) });
export const updateApplication = (id, application) => request(`/applications/${id}`, { method: "PUT", body: JSON.stringify(application) });
export const deleteApplication = (id) => request(`/applications/${id}`, { method: "DELETE" });
