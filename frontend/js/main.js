window.onload = function() {
  // add some key listeners from key_listener.js
  // window.addEventListener('keyup', function(event) { KeyListener.onKeyup(event); }, false);
  // window.addEventListener('keydown', function(event) { KeyListener.onKeydown(event); }, false);

  this.app = new App();
  this.app.init();
};


// should read teh settings here maybe?
function App() {
  this.connection = new FancyWebSocket( settings.webSocketUrl );
  console.log(this.connection.state());
  this.events = [];

  // TODO: Need to make a sync command from the server so it can send all the
  // game objects that were previously created.
  this.connection.bind( "connect", this.handleInitialConnection, this );
  // this.connection.bind( "createPlayer", this.createGameObj, this );
  // this.connection.bind( "createObject", this.createGameObj, this );
  this.connection.bind( "message", this.onMessage, this )
  // this.connection.bind( "sync", this.sync, this )
};

App.prototype = {
  init: function() {
    console.log("Doing shit")
  },

  handleInitialConnection: function(msg) {
    console.log("Doing initial connection")
    console.log(msg)
  },

  onMessage: function(msg) {
    console.log("update shit")
    console.log(msg)
  },
}
