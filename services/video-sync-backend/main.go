package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

type TimeSyncMessage struct {
	Type string  `json:"type"`
	T1   float64 `json:"t1,omitempty"`
	T2   float64 `json:"t2,omitempty"`
	T3   float64 `json:"t3,omitempty"`
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	log.Println("New WebSocket connection established")

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket read error:", err)
			return
		}

		var message TimeSyncMessage
		if err := json.Unmarshal(msg, &message); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}

		if message.Type == "timeSync" {
			handleTimeSync(conn, &message)
		} else {
			log.Printf("Received unknown message type: %s", message.Type)
		}
	}
}

func handleTimeSync(conn *websocket.Conn, message *TimeSyncMessage) {
	now := time.Now()
	t2 := float64(now.UnixNano()) / 1e6 // Current time in milliseconds

	// Simulate some processing time
	time.Sleep(10 * time.Millisecond)

	t3 := float64(time.Now().UnixNano()) / 1e6 // Current time in milliseconds

	response := TimeSyncMessage{
		Type: "timeSync",
		T1:   message.T1,
		T2:   t2,
		T3:   t3,
	}

	if err := conn.WriteJSON(response); err != nil {
		log.Println("WebSocket write error:", err)
	}
}