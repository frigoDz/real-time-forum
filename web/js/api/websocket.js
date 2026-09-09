let socket = null;
let reconnectTimer = null;
let reconnectDelay = 3000;
let isIntentionallyClosed = false;

export function connectWebsocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    isIntentionallyClosed = false;
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connection established");
            reconnectDelay = 3000; // Reset backoff delay on successful connection
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        };

        socket.onclose = (e) => {
            console.log("WebSocket connection closed:", e.reason);
            socket = null;
            if (!isIntentionallyClosed) {
                scheduleReconnect();
            }
        };

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                window.dispatchEvent(new CustomEvent("ws:message", { detail: data }));
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket connection error:", err);
            socket?.close();
        };
    } catch (err) {
        console.error("WebSocket initialization failed:", err);
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    if (reconnectTimer || isIntentionallyClosed) return;
    console.log(`Attempting WebSocket reconnect in ${reconnectDelay / 1000}s...`);
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        reconnectDelay = Math.min(reconnectDelay * 1.5, 15000); // Max delay 15s
        connectWebsocket();
    }, reconnectDelay);
}

export function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ receiverId: data.id, content: data.content }));
    }
}

export function disconnectWebsocket() {
    isIntentionallyClosed = true;
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (socket) {
        socket.close();
        socket = null;
    }
}