package handlers

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"net/http"
	websockets "real-time-forum/internal/websockets"

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

		manager.AddClient(userID, conn)
		manager.Broadcast(map[string]any{
			"type":   "user_online",
			"userId": userID,
		})

		defer func() {
			manager.RemoveClient(userID)

			manager.Broadcast(map[string]any{
				"type":   "user_offline",
				"userId": userID,
			})

			conn.Close()
		}()
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var input models.SendMessage

			err = json.Unmarshal(data, &input)
			if err != nil {
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

			receiverConn, online := manager.GetClient(input.ReceiverID)
			if !online {
				continue
			}

			err = receiverConn.WriteJSON(message)
			if err != nil {
				continue
			}
		}
	}
}
