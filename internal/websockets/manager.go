package websockets

import (
	"sync"

	"github.com/gorilla/websocket"
)

type ClientManager struct {
	clients map[int]*websocket.Conn
	mu      sync.RWMutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		clients: make(map[int]*websocket.Conn),
	}
}

func (m *ClientManager) AddClient(userID int, conn *websocket.Conn) {
	m.mu.Lock()
	m.clients[userID] = conn
	m.mu.Unlock()
}

func (m *ClientManager) RemoveClient(userID int) {
	m.mu.Lock()
	delete(m.clients, userID)
	m.mu.Unlock()
}

func (m *ClientManager) GetClient(userID int) (*websocket.Conn, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	conn, ok := m.clients[userID]
	return conn, ok
}

func (m *ClientManager) IsOnline(userID int) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	_, ok := m.clients[userID]
	return ok
}

func (m *ClientManager) Broadcast(data any) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, conn := range m.clients {
		if err := conn.WriteJSON(data); err != nil {
			continue
		}
	}
}
