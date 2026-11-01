const BASE = "/api";

async function request(path, { method = "GET", body, key, voter } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (key) headers["x-admin-key"] = key;
  if (voter) headers["x-voter-id"] = voter;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

export const list = (resource) => request(`/${resource}`);
export const create = (resource, body, key) => request(`/${resource}`, { method: "POST", body, key });
export const update = (resource, id, body, key) => request(`/${resource}/${id}`, { method: "PUT", body, key });
export const remove = (resource, id, key) => request(`/${resource}/${id}`, { method: "DELETE", key });
export const verifyKey = (key) => request("/admin/verify", { method: "POST", key });
export const getPoll = (voter) => request("/poll", { voter });
export const castVote = (leader, voter) => request("/poll/vote", { method: "POST", body: { leader }, voter });
export const getAllTime = (voter) => request("/poll/all-time", { voter });
export const castAllTimeVote = (picks, voter) => request("/poll/all-time/vote", { method: "POST", body: picks, voter });
