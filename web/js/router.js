import { state, chatState } from "./state.js";
import { renderHome, initHome } from "./views/forum.js";
import { renderLogin, initLogin } from "./views/login.js";
import { initLogout } from "./views/logout.js";
import { renderRegister, initRegister } from "./views/register.js";
import { renderError } from "./views/error.js"
import { initLikedPosts, initMyPosts } from "./views/filteredPosts.js";
import { initMessages, renderMessages } from "./views/messages.js";
import { initPostDetails, renderPostDetails } from "./views/post-details.js";

const routes = {
    "/": {
        title: "Home",
        render: renderHome,
        init: initHome
    },
    "/login": {
        title: "Login",
        render: renderLogin,
        init: initLogin
    },
    "/logout": {
        title: "Logout",
        render: () => "",
        init: initLogout
    },
    "/register": {
        title: "Register",
        render: renderRegister,
        init: initRegister
    },
    "/my-posts": {
        title: "My Posts",
        render: renderHome,
        init: initMyPosts
    },
    "/liked-posts": {
        title: "Liked Posts",
        render: renderHome,
        init: initLikedPosts
    },
    "/messages": {
        title: "Messages",
        render: renderMessages,
        init: initMessages
    },
    "/post": {
        title: "Post Details",
        render: renderPostDetails,
        init: initPostDetails
    },
    404: {
        title: "Not Found",
        render: renderError
    },
}

export function navigateTo(path) {
    history.pushState({}, "", path);
    router();
}

export const router = async () => {
    let path = window.location.pathname;

    if (path !== "/messages") {
        chatState.activeChatUser = null;
    }

    // Route guards with URL history synchronization
    if (!state.isAuthenticated && path !== "/login" && path !== "/register") {
        path = "/login";
        history.replaceState({}, "", path);
    } else if (state.isAuthenticated && (path === "/login" || path === "/register")) {
        path = "/";
        history.replaceState({}, "", path);
    }

    let route = routes[path] || routes[404];
    document.title = route.title;
    document.querySelector("#app").innerHTML = route.render();
    if (route.init) {
        route.init();
    }
}

document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
        e.preventDefault();
        navigateTo(link.getAttribute("href"));
    }
});

window.addEventListener("popstate", router);