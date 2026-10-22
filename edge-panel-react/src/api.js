const BASE = import.meta.env.VITE_API_URL + "/api/contacts";

// One helper for every request: sends it, reads the JSON, throws on errors
async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export const getContacts = () => request(BASE);

export const createContact = (name, phone) =>
  request(BASE, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, phone }),
  });

export const updateContact = (id, changes) =>
  request(`${BASE}/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(changes),
  });

export const deleteContact = (id) => request(`${BASE}/${id}`, { method: "DELETE" });