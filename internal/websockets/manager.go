package websockets

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn *websocket.Conn
	Mu   sync.Mutex
}

type ClientManager struct {
	clients map[int]*Client
	mu      sync.RWMutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		clients: make(map[int]*Client),
	}
}

func (m *ClientManager) AddClient(userID int, conn *websocket.Conn) {
	m.mu.Lock()
	m.clients[userID] = &Client{
		Conn: conn,
	}
	m.mu.Unlock()
}

func (m *ClientManager) RemoveClient(userID int) {
	m.mu.Lock()
	delete(m.clients, userID)
	m.mu.Unlock()
}

func (m *ClientManager) GetClient(userID int) (*Client, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	client, ok := m.clients[userID]
	return client, ok
}

func (m *ClientManager) IsOnline(userID int) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	_, ok := m.clients[userID]
	return ok
}

func (m *ClientManager) SendJSON(userID int, data any) error {
	m.mu.RLock()
	client, ok := m.clients[userID]
	m.mu.RUnlock()

	if !ok {
		return nil
	}

	client.Mu.Lock()
	defer client.Mu.Unlock()

	return client.Conn.WriteJSON(data)
}

func (m *ClientManager) Broadcast(data any) {
	m.mu.RLock()
	clients := make([]*Client, 0, len(m.clients))

	for _, client := range m.clients {
		clients = append(clients, client)
	}

	m.mu.RUnlock()

	for _, client := range clients {
		client.Mu.Lock()
		_ = client.Conn.WriteJSON(data)
		client.Mu.Unlock()
	}
}
