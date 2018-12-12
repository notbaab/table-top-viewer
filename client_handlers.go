// Holds all the client handler functiosn
package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
)

var connections map[*websocket.Conn]string // Maps the connection object to the client id
var clientIdMap map[string]*Client

// Client events is data sent from the client to the server
func HandleClientEvent(event []byte, conn *websocket.Conn) *Message {
	Trace.Printf("Received event: %s\n", string(event))

	// Putt in the input queue
	var message Message
	json.Unmarshal(event, &message)

	clientId := connections[conn]
	clientData := clientIdMap[clientId]
	Trace.Printf("Queueing %+v data is %s\n", message, string(*message.Data))
	clientData.QueueMessage(message)
	Trace.Printf("Queued %+v \n", clientData.InputQueue)
	return nil
	// return &message
}

func initializeClientData(conn *websocket.Conn) *Message {
	// initialize the connection
	Info.Println("Connecting client")

	// Init all data that a client uses
	client := NewClient(conn)

	AddClientDataToMap(clientIdMap, &client)
	AddClientToIdMap(&client, connections)

	connectionMessage := MakeConnectionMessage(client)

	Info.Printf("Syncing with %+v\n", connectionMessage)
	return &connectionMessage
}

// Makes the initial data message to send to the a connecting client.
func MakeConnectionMessage(client Client) Message {
	rawClientData, err := json.Marshal(client)
	rawJsonData := json.RawMessage(rawClientData)
	if err != nil {
		Error.Panicf("Couldn't format data: %+v. Err: %s\n\n", client, err)
	}

	connectionMessage := Message{Event: "connect", Data: &rawJsonData}
	return connectionMessage
}

func AddClientToIdMap(client *Client, connections map[*websocket.Conn]string) {
	connections[client.Socket] = client.Id
}

func AddClientDataToMap(mapToAdd map[string]*Client, clientToAdd *Client) {
	id := clientToAdd.Id
	mapToAdd[id] = clientToAdd
}
