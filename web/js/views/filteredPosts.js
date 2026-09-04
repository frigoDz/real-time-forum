import { getUsers } from "../api/websocket.js";
import { loadCategories, loadPosts, initMobileMenu, handleLikes, initCreatePostModal, renderUserLists } from "./forum.js";

export async function initMyPosts() {
    updateActiveLink("/my-posts");
    initMobileMenu();
    loadPosts({ filter: "my-posts" });
    loadCategories();
    handleLikes();
    initCreatePostModal();
    const users = await getUsers();
    renderUserLists(users);
}

export async function initLikedPosts() {
    updateActiveLink("/liked-posts");
    initMobileMenu();
    loadPosts({ filter: "liked-posts" });
    loadCategories();
    handleLikes();
    initCreatePostModal();
    const users = await getUsers();
    renderUserLists(users);
}

export function updateActiveLink(path) {
    document.querySelectorAll(".nav-group a.nav-item").forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active")
        } else {
            link.classList.remove("active")
        }
    })
}