let socket = null;

export function connectWebsocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    socket = new WebSocket("/api/ws")
    socket.onopen = () => {
        console.log("ws connection opened")
    }

    socket.onclose = e => {
        console.log("ws connection closed", e.reason)
    }

    socket.onmessage = e => {
        socket.onmessage = e => {
            let data = JSON.parse(e.data);
            console.log("ws incoming data", data);
            window.dispatchEvent(new CustomEvent("ws:message", { detail: data }));
        };
    }

    socket.onerror = err => {
        console.log("ws connection error", err)
    }
}

export function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ recieverId: data.id, content: data.content }))
    }
}

export function disconnectWebsocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}