import { logout } from "../api/auth.js";
import { navigateTo } from "../router.js";

export async function initLogout() {
    let error = await logout()
    if (!error) console.log(error)
    navigateTo("/login")
}