const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

export { API_BASE, apiGet, apiPost };

export const fetchProducts = () => apiGet("/luxuryfashion/fetch-products-shop");
export const fetchGallery = () => apiGet("/luxuryfashion/fetch-gallery");
export const fetchOrderHistory = () => apiGet("/api/orders/history");
export const fetchAdminOrders = () => apiGet("/api/orders/admin/all");
