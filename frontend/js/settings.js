// I like settings as a simple javascript object. I should make it json so it's easiy to pass down to the client but eh?

var settings =
{
  // network settings
  webSocketUrl: "ws://" + window.location.hostname + ":" + window.location.port +"/ws", // the websocket passed to the

  // do debugy things
  debug: true,
}
