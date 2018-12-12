package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"sync"
)

type State interface {
	BuildAddMessage() Message
}

// keeps track of data from a client
// Ignores Input queue and Socket when marshalling
type Client struct {
	Socket               *websocket.Conn `json:"-"`
	CurrentSequnceNumber int             `json:"sequenceNumber"`
	InputQueue           *MessageQueue   `json:"-"`
	Id                   string
}

type MessageQueue struct {
	sync.Mutex
	Queue []Message
}

type ClientMessage struct {
	Id   string `json:"id"`
	Data json.RawMessage
}

func NewClient(conn *websocket.Conn) (client Client) {
	messageQueue := MessageQueue{Queue: make([]Message, 0)}
	newClient := Client{}

	newClient.Socket = conn
	newClient.InputQueue = &messageQueue
	newClient.CurrentSequnceNumber = 0
	// TODO: Do we trust unique short id to be unique? Yeah probably.
	newClient.Id = UniqueShortId()

	return newClient
}

func NewMessageQueue() *MessageQueue {
	queue := NewQueue()
	messageQueue := MessageQueue{Queue: queue}
	return &messageQueue
}

func NewQueue() []Message {
	return make([]Message, 0)
}

func (c *Client) ReadWholeQueue() ([]Message, int) {
	c.InputQueue.Lock()

	messages := make([]Message, len(c.InputQueue.Queue))
	messages = c.InputQueue.Queue[:]
	c.InputQueue.Queue = NewQueue()
	sequenceNumber := c.CurrentSequnceNumber
	c.InputQueue.Unlock()

	return messages, sequenceNumber
}

func (c *Client) QueueMessage(message Message) {
	c.InputQueue.Lock()

	c.InputQueue.Queue = append(c.InputQueue.Queue, message)
	c.CurrentSequnceNumber += 1
	c.InputQueue.Unlock()
}
