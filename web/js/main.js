import { checkAuth } from "./api/auth.js";
import {state, setUser} from "./state.js";
import { router } from "./router.js";
import { connectWebsocket } from "./api/websocket.js";

async function initApp() {
    const user = await checkAuth();
    setUser(user);
    connectWebsocket();
    router();
}

document.addEventListener("DOMContentLoaded", initApp);