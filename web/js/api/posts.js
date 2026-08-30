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

export async function getPosts() {
    try {
        const res = await fetch("/api/posts", {
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