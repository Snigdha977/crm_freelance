const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Something went wrong.");
    error.code = data.code;
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  signup: (body) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  listContacts: () => request("/contacts"),
  createContact: (body) => request("/contacts", { method: "POST", body: JSON.stringify(body) }),
  updateContact: (id, body) => request(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: "DELETE" }),

  listDeals: () => request("/deals"),
  createDeal: (body) => request("/deals", { method: "POST", body: JSON.stringify(body) }),
  updateDeal: (id, body) => request(`/deals/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: "DELETE" }),

  billingStatus: () => request("/billing/status"),
  createCheckout: () => request("/billing/checkout", { method: "POST" }),
  cancelSubscription: () => request("/billing/cancel", { method: "POST" }),
};
