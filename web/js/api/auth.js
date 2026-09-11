import { setUser, state } from "../state.js";

const authChannel = typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel("real-time-forum:auth");

function notifyLocalLogout() {
    window.dispatchEvent(new Event("auth:logout"));
}

export function broadcastLogout() {
    const message = { type: "logout", timestamp: Date.now() };

    authChannel?.postMessage(message);
    try {
        // BroadcastChannel is not available in every browser; storage events cover those tabs.
        localStorage.setItem("real-time-forum:auth-logout", JSON.stringify(message));
    } catch (error) {
        console.warn("Unable to notify other tabs about logout:", error);
    }
    notifyLocalLogout();
}

authChannel?.addEventListener("message", (event) => {
    if (event.data?.type === "logout") notifyLocalLogout();
});

window.addEventListener("storage", (event) => {
    if (event.key === "real-time-forum:auth-logout" && event.newValue) {
        notifyLocalLogout();
    }
});

export async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) return null;
        const user = await response.json();
        return user;
    } catch (error) {
        console.log("Not logged in!", error);
        return null;
    }
}

export async function login(identifier, password) {
    try {
        const response = await fetch("/api/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'identifier': identifier, 'password': password })
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || "Login failed!" };
        }
        const data = await response.json();
        setUser(data.data);
        return data.data;
    } catch (error) {
        console.log(error);
        return { error: "Network error. Please try again." };
    }
}

export async function register(username, email, password, firstName, lastName, age, gender) {
    try {
        const response = await fetch("/api/register", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'nickname': username,
                'email': email,
                'password': password,
                'firstName': firstName,
                'lastName': lastName,
                'age': age,
                'gender': gender
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || "Registration failed!" };
        }
        const id = await response.json();
        return id;
    } catch (error) {
        console.log(error);
        return { error: "Network error. Please try again." };
    }
}

export async function logout() {
    setUser(null);
    broadcastLogout();
    try {
        await fetch("/api/logout", { method: 'POST' });
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        return null;
    }
}
