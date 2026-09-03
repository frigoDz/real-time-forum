export async function createPost(data) {
    try {
        const res = await fetch("/api/posts/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: data.content,
                categories: data.categories
            })
        });
        const result = await res.json();
        if (!res.ok) {
            return { error: result.error || "Failed to create post" };
        }
        return result;
    } catch (error) {
        return { error: "Network connection error. Please try again." };
    }
}

export async function getPosts(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        const url = query ? `/api/posts?${query}` : "/api/posts";
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

export async function getPostById(id) {
    try {
        const res = await fetch(`/api/posts?post_id=${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error(`Failed to fetch post ${id}:`, error);
        return null;
    }
}