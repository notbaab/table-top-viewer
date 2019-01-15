package table_top_viewer

import (
	"encoding/json"
)

type Message struct {
	Event string           `json:"event"`
	Data  *json.RawMessage `json:"data"` // how data is parsed depends on the event
}

type Events struct {
	Events []Message `json:"events"`
}

type WelcomeMessage struct {
	Message string `json:"message"`
}

func MakeConnectionMessage(client Client) (*Message, error) {
	wm := WelcomeMessage{Message: "hello"}

	rawClientData, err := json.Marshal(wm)
	rawJsonData := json.RawMessage(rawClientData)
	if err != nil {
		Error.Panicf("Couldn't format data: %+v. Err: %s\n\n", client, err)
		return nil, err
	}

	connectionMessage := Message{Event: "connect", Data: &rawJsonData}
	return &connectionMessage, nil
}
