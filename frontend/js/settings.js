// I like settings as a simple javascript object. I should make it json so it's easiy to pass down to the client but eh?

var settings =
{
  // network settings
  webSocketUrl: "ws://" + window.location.hostname + ":" + window.location.port +"/ws", // the websocket passed to the
  canvasId: "gamecanvas",
  defaultCanvasDim: {
    x: 1600,
    y: 1200,
  },

  gridSpace: {
    x: 30,
    y: 24,
  },

  // do debugy things
  debug: true,
}
