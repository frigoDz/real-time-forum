export const state = {
    user: null,
    isAuthenticated: false
}

export function setUser(data) {
    state.user = data;
    state.isAuthenticated = !!data;
}

export const chatState = {
    activeChatUser: null,
    activeChatUserNickname: null,
    messages: [],
    chatOffset: 0,
    hasMoreMessages: false,
    unreadUserIds: new Set()
};

export function markUserUnread(userId) {
    if (userId) {
        chatState.unreadUserIds.add(parseInt(userId, 10));
    }
}

export function markUserRead(userId) {
    if (userId) {
        chatState.unreadUserIds.delete(parseInt(userId, 10));
    }
}
