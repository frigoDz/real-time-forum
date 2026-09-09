import { getUsers } from "../api/messages.js";
import { loadCategories, loadPosts, initMobileMenu, handleLikes, initCreatePostModal, renderUserLists, setupWsPresenceListener } from "./forum.js";

export async function initMyPosts() {
    updateActiveLink("/my-posts");
    initMobileMenu();
    setupWsPresenceListener();
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
    setupWsPresenceListener();
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