export async function toggleLike(postId) {
    try {
        const res = await fetch(`/api/likes?post_id=${postId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        })
        if (!res.ok) return {error: "Error toggling like!"};
        return await res.json();
    } catch (error) {
        return {error: "Network connection error!"};
    }
}