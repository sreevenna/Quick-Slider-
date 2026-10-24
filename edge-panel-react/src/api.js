const API = import.meta.env.VITE_API_URL + "/api";

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) =>
  t ? localStorage.setItem("token", t) : localStorage.removeItem("token");

// One helper for every request: adds the token, reads JSON, throws on errors
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) onUnauthorized(); // token expired
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const register = (name, email, password) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const getMe = () => request("/auth/me");

export const getContacts = () => request("/contacts");

export const createContact = (name, phone) =>
  request("/contacts", { method: "POST", body: JSON.stringify({ name, phone }) });

export const updateContact = (id, changes) =>
  request(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(changes) });

export const deleteContact = (id) => request(`/contacts/${id}`, { method: "DELETE" });