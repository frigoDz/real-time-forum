import { broadcastLogout, checkAuth } from "./api/auth.js";
import {state, setUser} from "./state.js";
import { router } from "./router.js";
import { connectWebsocket, disconnectWebsocket } from "./api/websocket.js";

const nativeFetch = window.fetch.bind(window);
let endingSession = false;

window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    const request = args[0];
    const url = typeof request === "string" ? request : request?.url;
    const isApiRequest = url && new URL(url, window.location.origin).pathname.startsWith("/api/");

    if (response.status === 401 && isApiRequest && state.isAuthenticated) {
        window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return response;
};

function endSession({ notifyOtherTabs = false } = {}) {
    if (endingSession) return;
    endingSession = true;
    try {
        setUser(null);
        disconnectWebsocket();
        if (notifyOtherTabs) broadcastLogout();

        if (window.location.pathname !== "/login") {
            history.replaceState({}, "", "/login");
            router();
        }
    } finally {
        endingSession = false;
    }
}

window.addEventListener("auth:logout", () => endSession());
window.addEventListener("auth:unauthorized", () => endSession({ notifyOtherTabs: true }));

async function initApp() {
    const user = await checkAuth();
    setUser(user);
    if (user) connectWebsocket();
    router();
}

document.addEventListener("DOMContentLoaded", initApp);
