import { logout } from "../api/auth.js";

export async function initLogout() {
    if (document.prerendering || document.visibilityState === "prerender") {
        document.addEventListener("prerenderingchange", () => {
            initLogout();
        }, { once: true });
        return;
    }

    await logout();
}
