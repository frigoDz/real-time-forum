package handlers

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	websockets "real-time-forum/internal/websockets"
	"strings"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WebSocketHandler(manager *websockets.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		client, oldClient := manager.AddClient(userID, conn)

		if oldClient != nil {
			oldClient.Conn.Close()
		}

		manager.Broadcast(map[string]any{
			"type":   "user_online",
			"userId": userID,
		})

		defer func() {
			manager.RemoveClient(userID, client)

			if !manager.IsOnline(userID) {
				manager.Broadcast(map[string]any{
					"type":   "user_offline",
					"userId": userID,
				})
			}

			conn.Close()
		}()
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(
					err,
					websocket.CloseGoingAway,
					websocket.CloseNormalClosure,
					websocket.CloseNoStatusReceived,
				) {
					log.Printf("websocket error for user %d: %v", userID, err)
				}

				break
			}

			var input models.SendMessage

			err = json.Unmarshal(data, &input)
			if err != nil {
				log.Printf("invalid websocket message from user %d: %v", userID, err)
				continue
			}

			input.Content = strings.TrimSpace(input.Content)

			if input.ReceiverID <= 0 || input.Content == "" {
				continue
			}

			if input.ReceiverID == userID {
				continue
			}
			message := models.Message{
				SenderID:   userID,
				ReceiverID: input.ReceiverID,
				Content:    input.Content,
			}

			_, err = database.CreateMessage(message)
			if err != nil {
				continue
			}

			if err := manager.SendJSON(input.ReceiverID, message); err != nil {
				continue
			}
		}
	}
}
