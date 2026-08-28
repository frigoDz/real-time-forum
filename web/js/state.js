export const state = {
    user: null,
    isAuthenticated: false
}

export function setUser(data) {
    state.user = data;
    state.isAuthenticated = !!data;
}