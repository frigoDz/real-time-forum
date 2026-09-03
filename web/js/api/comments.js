export async function getComments(postID) {
    try {
        const res = await fetch(`/api/comments?post_id=${postID}`)
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        console.log(error)
        return []
    }
}

export async function createComment(postId, content) {
    try {
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                postId: parseInt(postId, 10),
                content: content
            })
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to create comment" };
        }
        return data;
    } catch (error) {
        return { error: "Network connection error. Please try again." };
    }
}
