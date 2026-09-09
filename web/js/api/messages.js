export async function fetchMessages(userId, limit = 10, offset = 0) {
    try {
        const res = await fetch(`/api/messages?user_id=${userId}&limit=${limit}&offset=${offset}`)
        if (!res.ok) return { error: "Error fetching messages!" }
        return await res.json()
    } catch (error) {
        return { error: "Network error, try again later!" }
    }
}

export async function getUsers() {
    try {
        const res = await fetch("/api/conversations");
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}