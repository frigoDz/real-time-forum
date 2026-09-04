import { logout } from "../api/auth.js";
import { disconnectWebsocket } from "../api/websocket.js";
import { navigateTo } from "../router.js";

export async function initLogout() {
    if (document.prerendering || document.visibilityState === "prerender") {
        document.addEventListener("prerenderingchange", () => {
            initLogout();
        }, { once: true });
        return;
    }

    disconnectWebsocket();
    let error = await logout();
    if (error) console.error(error);
    navigateTo("/login");
}