package main

import (
	"github.com/gorilla/websocket"
	"net/http"
	"os"
)

func cleanUpSocket(conn *websocket.Conn) *Message {
	Info.Printf("Cleaning up connection from %s\n", conn.RemoteAddr())
	return nil
}

// TODO: SHould this be in server vars?
func initializeConnectionData() (map[*websocket.Conn]string, map[string]*Client) {
	Trace.Println("Initialize connection varibles")
	// TODO: Access if we need the clients variable
	// clients = make(map[*websocket.Conn]*ClientData)
	connections := make(map[*websocket.Conn]string)
	clientIdMap := make(map[string]*Client)
	return connections, clientIdMap

}
func setupFileServer(dir string) {
	// handle all requests by serving a file of the same name
	fs := http.Dir(dir)
	fileHandler := http.FileServer(fs)
	http.Handle("/", fileHandler)
}

func setupNetworkController() NetworkController {
	controller := NewNetworkController(HandleClientEvent,
		cleanUpSocket,
		initializeClientData)
	http.HandleFunc("/ws", controller.WsHandler)
	return controller
}

func main() {
	InitLogger(os.Stdout, os.Stdout, os.Stdout, os.Stderr)
	setupFileServer("frontend")
	setupNetworkController()
	// controller := setupNetworkController()

	// TODO: Remove them as global variables
	connections, clientIdMap = initializeConnectionData()
	Info.Println("Starting")
	runHttpServer("0.0.0.0:5658")
}

func runHttpServer(addr string) {
	// this call blocks -- the progam runs here forever
	err := http.ListenAndServe(addr, nil)
	Warning.Println(err.Error())
}
