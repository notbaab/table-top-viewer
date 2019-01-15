package table_top_viewer

import (
	// "encoding/json"
	"github.com/gorilla/websocket"
)

type Room struct {
	Clients map[*Client]bool

	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
}

func (r *Room) CleanUpHandler(c Client) {
	Info.Printf("cleaning up connection from %s\n", c.Socket.RemoteAddr())
	err := c.Socket.Close()

	if err != nil {
		Error.Println(err.Error())
	}
}

func NewRoom() *Room {
	return &Room{
		Clients:    make(map[*Client]bool),
		broadcast:  make(chan Message, 5),
		register:   make(chan *Client, 5),
		unregister: make(chan *Client, 5),
	}
}

func (r *Room) run() {
	for {
		select {
		case client := <-r.register:
			r.Clients[client] = true
		case client := <-r.unregister:
			if _, ok := r.Clients[client]; ok {
				delete(r.Clients, client)
				close(client.sendChan)
			}
		case message := <-r.broadcast:
			for client := range r.Clients {
				select {
				case client.sendChan <- message:
				default:
					close(client.sendChan)
					delete(r.Clients, client)
				}
			}
		}
	}
}

func (r *Room) doMessage(message Message, srcClient *Client) error {
	Trace.Printf("Got a thing %+v data is %s\n", message, string(*message.Data))
	return nil
}

func (r *Room) AddClient(conn *websocket.Conn) (Client, error) {
	client := NewClient(conn, r)

	connectionMessage, err := MakeConnectionMessage(client)
	r.register <- &client

	if err != nil {
		Error.Printf("Can't make connection message, bailing. Err: %s", err.Error())
		return client, err
	}

	err = client.send(*connectionMessage)
	if err != nil {
		Error.Printf("Can't format connection message, bailing. Err: %s", err.Error())
		return client, err
	}

	go client.readRoutine()
	go client.writeRoutine()

	return client, nil
}
