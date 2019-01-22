function main(w) {
  w.app = new App();
  w.app.init();
  w.app.start();
  // w.app.loadMap("img/map.jpg");
}

window.onload = function() {
  main(window);
};

// should read the settings here maybe?
function App() {
  this.connection = new FancyWebSocket( settings.webSocketUrl );
  console.log(this.connection.state());
  this.events = [];
  this.imageLoader = new ImageLoader();

  // TODO: Set default
  this.background = undefined;
  this.windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  this.view = new View(document.getElementById(settings.canvasId));
  this.world = new World();

  this.connection.bind( "connect", this.handleInitialConnection, this );
  this.connection.bind( "state", this.handleState, this );
  this.connection.bind( "message", this.onMessage, this );
}

App.prototype = {
  init: function() {
    console.log("Doing shit");
    this.canvas = document.getElementById(settings.canvasId);
    this.context = this.canvas.getContext("2d");

    // size canvas to the given size
    this.canvas.width = this.windowSize.width;
    this.canvas.height = this.windowSize.height;
  },

  handleInitialConnection: function(msg) {
    console.log("Doing initial connection");
    console.log(msg);
    // Simple test to flex the backend until something happens
    this.connection.send("test", {data: 1})
  },

  handleState: function(msg) {
    console.log("here");
    this.handleInitialState(msg);
    // this.loadMap(msg.background);
    // sets the new state what it
    this.state = msg.state;
  },

  handleInitialState: function(msg) {
    console.log("here");
    console.log(msg);
    this.state = msg.state;
    // sets the new state what it
    this.loadMap(msg.state.map.img_url);
    this.loadPlayers(msg.state.players);
  },

  loadPlayers: function(players) {
    let that = this
    for (var i = 0; i < players.length; i++) {
      let loadPromise = this.imageLoader.getImage(players[i].avatar_url);
      let playerState = players[i];
      loadPromise.then(function(img) {
        that.world.addPlayerUnit(playerState, img);
      })
    }

  },

  onMessage: function(msg) {
    console.log("update shit");
    console.log(msg);
  },

  loadMap: function(src) {
    let that = this;
    let backgroundPromise = this.imageLoader.getImage(src);

    backgroundPromise.then(this.postBackgroundLoad.bind(this),
                           this.onImageLoadError.bind(this));
  },

  onImageLoadError(img) {
    console.log(img);
  },

  createPlayerUnit(playerState, loadedImg) {
    let frames = [
      { x: 0, y: 0, width: img.width, height: img.height},
    ];

    return new PlayerUnit(img, frames, )

  },

  // called after the background image is loaded
  postBackgroundLoad(img) {
    this.world.setNewBackground(img);
    this.world.setNewGridBox(this.state.map.grid_space[0], this.state.map.grid_space[1]);
    this.view.addDrawable(this.world);

    this.background = img;
    this.scaleBackgroundToFull();

    this.setupMouseListener();
  },

 //  getImage(url) {
 //    return new Promise(function(resolve, reject){
 //        var img = new Image()
 //        img.onload = function(){
 //            resolve(img)
 //        }
 //        img.onerror = function(){
 //            reject(img)
 //        }
 //        img.src = url
 //    })
 // },

  setupMouseListener: function() {
    let that = this;
    this.view.mouse.addEventListener("mousedown", (e) => {
      // convert the x and y coordinates to world coordinates and pass to the
      // world on mouseClick
      let worldCoordinates = that.view.toWorld(e.pageX, e.pageY);
      // only call the world mouse click if the coordinates are in the worlds
      if (worldCoordinates.x < 0 || worldCoordinates.x > that.background.width ||
        worldCoordinates.y < 0 || worldCoordinates.y > that.background.height){
        return;
      }

      that.world.mouseClick(worldCoordinates.x, worldCoordinates.y);
    });
  },

  start: function() {
    this.view.start();
    this.loop();
  },

  loop: function() {
    let that = this;
    this.view.display();
    requestAnimationFrame(() => {
      that.loop();
    });
  },

  scaleBackgroundToFull: function() {
    // scales the background to try to fill the entire canvas
    // by picking the dimension that needs to be scaled the most
    let widthScale = this.background.width / this.canvas.width;
    let heightScale = this.background.height / this.canvas.height;
    let biggerScale = widthScale > heightScale ? widthScale : heightScale;
    this.view.setScale(1 / biggerScale);
  },
};
