import { logout } from "../api/auth.js";
import { disconnectWebsocket } from "../api/websocket.js";
import { navigateTo } from "../router.js";

export async function initLogout() {
    let error = await logout()
    if (!error) console.log(error)
    disconnectWebsocket()
    navigateTo("/login")
}