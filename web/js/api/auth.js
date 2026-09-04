import { setUser, state } from "../state.js";

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
    try {
        await fetch("/api/logout", { method: 'POST' });
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        setUser(null);
        return null;
    }
}