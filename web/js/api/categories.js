export async function getCategories() {
  try {
    const res = await fetch("/api/categories", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}
