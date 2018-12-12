// backend node for managing connections
package main

import (
    // "flag"
    // "flag"
    "encoding/json"
    "errors"
    "fmt"
    "log"
    "net"
    "net/http"
    "net/url"

    "github.com/gorilla/websocket"
)

/// Generic event handlers interface
/// Each returns a Message that if not nil, will be queue and sent
/// to the socket connecting

// Called when we detect a disconnect from the client
type cleanUpFunction func(*websocket.Conn) *Message

// Called when we the client sends a message
type eventHandlerFunction func([]byte, *websocket.Conn) *Message

// Called after upgrading the http connection to a websocket
type connectionHandlerFunction func(*websocket.Conn) *Message

// a backend controller abstracts handling and managing websocket connections
type NetworkController struct {
    EventHandler      eventHandlerFunction
    CleanUpHandler    cleanUpFunction
    ConnectionHandler connectionHandlerFunction

    connections map[*websocket.Conn]bool
}

func NewNetworkController(event eventHandlerFunction, cleanUp cleanUpFunction,
    connections connectionHandlerFunction) NetworkController {

    controller := NetworkController{EventHandler: event, CleanUpHandler: cleanUp,
        ConnectionHandler: connections}

    controller.connections = make(map[*websocket.Conn]bool)

    return controller
}

func (b NetworkController) BroadCastPackets(msg []byte, excludeList map[*websocket.Conn]bool) {

    for conn := range b.connections {
        if _, ok := excludeList[conn]; ok {
            continue
        }

        b.SendToClient(msg, conn)
    }
}

func (b NetworkController) WsHandler(writer http.ResponseWriter, request *http.Request) {
    conn, err := websocket.Upgrade(writer, request, nil, 1024, 1024)

    Info.Println("Doing a websocket")

    if _, ok := err.(websocket.HandshakeError); ok {
        log.Println("error")
        http.Error(writer, "got a websocket handshake", 400)
        return
    } else if err != nil {
        log.Println(err)
        return
    }

    connectionMessage := b.ConnectionHandler(conn)
    defer b.CleanUpHandler(conn)      // if this function ever exits, clean up the data
    defer delete(b.connections, conn) // if this function ever exits, clean up the data

    if connectionMessage != nil {
        err := b.SendMessage(*connectionMessage, conn)
        if err != nil {
            log.Printf("Some shit happend: %+v\n", err)
        }
    } else {
        log.Printf("Shits nil")
    }

    b.connections[conn] = true

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            return
        }
        b.EventHandler(msg, conn)
    }
}

func (b NetworkController) SendToClient(rawMessage []byte, conn *websocket.Conn) error {
    if err := conn.WriteMessage(websocket.TextMessage, rawMessage); err != nil {
        b.CleanUpHandler(conn)
        return err
    } else {
        return nil
    }
}

func (b NetworkController) SendMessage(msg Message, conn *websocket.Conn) error {
    // handler specified a message to send back to the client
    rawMessage, err := json.Marshal(msg)
    if err != nil {
        return err
    }
    Trace.Printf("Sending %s", string(rawMessage))
    return b.SendToClient(rawMessage, conn)
}

func (b NetworkController) Send(msg Message, client Client) error {
    return b.SendMessage(msg, client.Socket)
}

// send all game objects that are currently in the game object map to the
// client connected
func (b NetworkController) SyncClient(client *Client, state []State) {
    // TODO: Assess whether or not this is going to be to slow
    syncData := Events{Events: make([]Message, 0)}

    for _, obj := range state {
        addMessage := obj.BuildAddMessage()
        syncData.Events = append(syncData.Events, addMessage)
    }

    messageJson, _ := json.Marshal(syncData)
    b.SendToClient(messageJson, client.Socket)
}

// adds a connection to the connection map.
func (b NetworkController) AddNewConnection(conn *websocket.Conn) {
    b.connections[conn] = true
}

func (b NetworkController) NewWebsocket(connectionUrl string) (*websocket.Conn, error) {
    u, err := url.Parse(connectionUrl)
    if err != nil {
        log.Println(err)
        return nil, errors.New("Cannot parse connection url" + connectionUrl)
    }
    log.Println(u)

    log.Println(u.Host)
    rawConn, err := net.Dial("tcp", u.Host)
    if err != nil {
        log.Println(err)
        return nil, errors.New("cannot dial " + u.Host)
    }

    wsHeaders := http.Header{
        "Origin": {u.Host},
        // your milage may differ
        "Sec-WebSocket-Extensions": {
            "permessage-deflate; client_max_window_bits, x-webkit-deflate-frame"},
    }

    wsConn, resp, err := websocket.NewClient(rawConn, u, wsHeaders, 1024, 1024)

    if err != nil {

        return nil, fmt.Errorf("websocket.NewClient Error: %s\nResp:%+v", err, resp)

    }

    b.AddNewConnection(wsConn)

    return wsConn, nil
}
