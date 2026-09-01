import { loadCategories, loadPosts, initMobileMenu } from "./forum.js";

export function initMyPosts() {
    updateActiveLink("/my-posts");
    initMobileMenu();
    loadPosts({ filter: "my-posts" });
    loadCategories();
}

export function initLikedPosts() {
    updateActiveLink("/liked-posts");
    initMobileMenu();
    loadPosts({ filter: "liked-posts" });
    loadCategories();
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