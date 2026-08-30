import { state } from "./state.js";
import { renderHome, initHome } from "./views/forum.js";
import { renderLogin, initLogin } from "./views/login.js";
import { initLogout } from "./views/logout.js";
import { renderRegister, initRegister } from "./views/register.js";
import { renderAdmin, initAdmin } from "./views/admin.js";
import { renderError } from "./views/error.js"

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
    "/admin": {
        title: "Admin Dashboard",
        render: renderAdmin,
        init: initAdmin
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

    // Route guards with URL history synchronization
    if (!state.isAuthenticated && path !== "/login" && path !== "/register" && path !== "/admin") {
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