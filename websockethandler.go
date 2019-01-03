// backend node for managing connections
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// a backend controller abstracts handling and managing websocket connections
type NetworkController struct {
	Rooms map[string]*Room
}

func NewNetworkController() NetworkController {
	controller := NetworkController{Rooms: make(map[string]*Room)}
	return controller
}

// entry point for the web socket handler. Upgrades the websocket and starts the
// worker that handlers messages
func (nc NetworkController) WsHandler(writer http.ResponseWriter, request *http.Request) {
	vars := mux.Vars(request)

	conn, err := websocket.Upgrade(writer, request, nil, 1024, 1024)

	roomId := vars["roomId"]

	Info.Println("Doing a websocket")

	if _, ok := err.(websocket.HandshakeError); ok {
		log.Println("error")
		http.Error(writer, "got a websocket handshake", 400)
		return
	} else if err != nil {
		log.Println(err)
		return
	}
	// get or create the room.
	// TODO: Database query here
	room, exists := nc.Rooms[roomId]
	if !exists {
		room = NewRoom()
		nc.Rooms[roomId] = room
		go room.run()
	}

	// Initialize a client object in the correct room
	client, err := room.AddClient(conn)
	if err != nil {
		Error.Printf("Something happened %s", err.Error())
		return
	}

	Info.Printf("Added client %s to room %s", client.Id, roomId)
}

// Some leftover code that has the server establishing a websocket connection with
// a url. It's useful and I don't have the heart to remove it yet
// func (b NetworkController) NewWebsocket(connectionUrl string) (*websocket.Conn, error) {
// 	u, err := url.Parse(connectionUrl)
// 	if err != nil {
// 		log.Println(err)
// 		return nil, errors.New("Cannot parse connection url" + connectionUrl)
// 	}
// 	log.Println(u)

// 	log.Println(u.Host)
// 	rawConn, err := net.Dial("tcp", u.Host)
// 	if err != nil {
// 		log.Println(err)
// 		return nil, errors.New("cannot dial " + u.Host)
// 	}

// 	wsHeaders := http.Header{
// 		"Origin": {u.Host},
// 		// your milage may differ
// 		"Sec-WebSocket-Extensions": {
// 			"permessage-deflate; client_max_window_bits, x-webkit-deflate-frame"},
// 	}

// 	wsConn, resp, err := websocket.NewClient(rawConn, u, wsHeaders, 1024, 1024)

// 	if err != nil {
// 		return nil, fmt.Errorf("websocket.NewClient Error: %s\nResp:%+v", err, resp)
// 	}

// 	b.AddNewConnection(wsConn)
// 	return wsConn, nil
// }
