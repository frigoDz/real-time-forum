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
