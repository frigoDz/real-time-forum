import { loadCategories, loadPosts, initMobileMenu, handleLikes, initCreatePostModal } from "./forum.js";

export function initMyPosts() {
    updateActiveLink("/my-posts");
    initMobileMenu();
    loadPosts({ filter: "my-posts" });
    loadCategories();
    handleLikes();
    initCreatePostModal();
}

export function initLikedPosts() {
    updateActiveLink("/liked-posts");
    initMobileMenu();
    loadPosts({ filter: "liked-posts" });
    loadCategories();
    handleLikes();
    initCreatePostModal();
}

export function updateActiveLink(path) {
    document.querySelectorAll(".nav-group a.nav-item").forEach(link =>{
        if (link.getAttribute("href") === path) {
            link.classList.add("active")
        } else {
            link.classList.remove("active")
        }
    })
}