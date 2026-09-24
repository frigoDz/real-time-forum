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
	clients map[int]map[*Client]struct{}
	mu      sync.RWMutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		clients: make(map[int]map[*Client]struct{}),
	}
}

func (m *ClientManager) AddClient(userID int, conn *websocket.Conn) *Client {
	m.mu.Lock()
	defer m.mu.Unlock()

	client := &Client{Conn: conn}

	if m.clients[userID] == nil {
		m.clients[userID] = make(map[*Client]struct{})
	}

	m.clients[userID][client] = struct{}{}
	return client
}

func (m *ClientManager) RemoveClient(userID int, client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()

	userClients, ok := m.clients[userID]
	if !ok {
		return
	}

	delete(userClients, client)

	if len(userClients) == 0 {
		delete(m.clients, userID)
	}
}

func (m *ClientManager) RemoveAllClients(userID int) []*Client {
	m.mu.Lock()
	defer m.mu.Unlock()

	userClients := m.clients[userID]
	delete(m.clients, userID)

	clients := make([]*Client, 0, len(userClients))
	for client := range userClients {
		clients = append(clients, client)
	}
	return clients
}

func (m *ClientManager) IsOnline(userID int) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return len(m.clients[userID]) > 0
}

func (m *ClientManager) SendJSON(userID int, data any) error {
	m.mu.RLock()
	clients := make([]*Client, 0, len(m.clients[userID]))
	for client := range m.clients[userID] {
		clients = append(clients, client)
	}
	m.mu.RUnlock()

	for _, client := range clients {
		client.Mu.Lock()
		err := client.Conn.WriteJSON(data)
		client.Mu.Unlock()
		if err != nil {
			return err
		}
	}
	return nil
}

func (m *ClientManager) Broadcast(data any) {
	m.mu.RLock()
	clients := make([]*Client, 0)
	for _, userClients := range m.clients {
		for client := range userClients {
			clients = append(clients, client)
		}
	}
	m.mu.RUnlock()

	for _, client := range clients {
		client.Mu.Lock()
		_ = client.Conn.WriteJSON(data)
		client.Mu.Unlock()
	}
}
