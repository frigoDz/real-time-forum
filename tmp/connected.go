package main

import (
	"bufio"
	"fmt"
	"log"
	"os"

	"github.com/gorilla/websocket"
)

type Message struct {
	ReceiverID int    `json:"receiverId"`
	Content    string `json:"content"`
}

func main() {
	if len(os.Args) != 3 {
		log.Fatal("usage: go run tmp/connected.go <token> <receiverID>")
	}

	token := os.Args[1]

	var receiverID int
	if _, err := fmt.Sscanf(os.Args[2], "%d", &receiverID); err != nil {
		log.Fatal(err)
	}

	conn, _, err := websocket.DefaultDialer.Dial(
		"ws://localhost:8080/api/ws",
		map[string][]string{
			"Cookie": {"session=" + token},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	fmt.Println("Connected!")
	fmt.Println("Type a message and press Enter:")

	go func() {
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				log.Println("read error:", err)
				return
			}

			fmt.Println("RECEIVED:", string(data))
		}
	}()

	scanner := bufio.NewScanner(os.Stdin)

	for scanner.Scan() {
		text := scanner.Text()

		message := Message{
		ReceiverID: receiverID,
		Content:    text,
	}

	fmt.Printf("SENDING: %+v\n", message)

	err := conn.WriteJSON(message)

		if err != nil {
			log.Println("SEND ERROR:", err)
			return
		}

		fmt.Println("SENT:", text)
	}
}
