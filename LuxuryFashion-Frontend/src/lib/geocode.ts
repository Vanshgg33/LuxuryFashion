export async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { "User-Agent": "RangeelaDhaba/1.0" } });
  if (!res.ok) throw new Error("Failed to reverse geocode");
  const data = await res.json();
  const addr = data.address || {};
  return {
    street: addr.road || addr.suburb || "",
    city: addr.city || addr.town || addr.village || "",
    state: addr.state || "",
    zipCode: addr.postcode || "",
    country: addr.country || "",
  };
}

