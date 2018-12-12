package main

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
