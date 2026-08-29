package websocket

import (
	"github.com/gorilla/websocket"
	"sync"
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
	defer m.mu.Unlock()

	m.clients[userID] = conn
}
func (m *ClientManager) RemoveClient(userID int) {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.clients, userID)
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
