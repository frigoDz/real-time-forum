import { checkAuth } from "./api/auth.js";
import {state, setUser} from "./state.js";
import { router } from "./router.js";

async function initApp() {
    const user = await checkAuth();
    setUser(user);
    router()
}

document.addEventListener("DOMContentLoaded", initApp);