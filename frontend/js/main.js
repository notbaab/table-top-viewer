function main(w) {
  w.app = new App();
  w.app.init();
  w.app.setCurrentMap("img/map.jpg");
}

window.onload = function() {
  main(window);
};

// should read the settings here maybe?
function App() {
  this.connection = new FancyWebSocket( settings.webSocketUrl );
  console.log(this.connection.state());
  this.events = [];

  // TODO: Set default
  this.background = undefined;
  this.windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  this.view = new View(document.getElementById(settings.canvasId));

  this.connection.bind( "connect", this.handleInitialConnection, this );
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
  },

  onMessage: function(msg) {
    console.log("update shit");
    console.log(msg);
  },

  setCurrentMap: function(src) {
    let img = new Image();
    img.src = src;
    let ctx = this.context;
    let that = this;
    img.onload = function() {
      that.background = img;
      that.scaleBackgroundToFull();
      that.postBackgroundLoad();
    };
  },

  postBackgroundLoad() {
    // start loading the new image now
    let wizardImg = new Image();
    wizardImg.src = "img/wizard.png";

    this.fullBoxWidth = this.background.width / settings.gridSpace.x;
    this.fullBoxHeight = this.background.height / settings.gridSpace.y;

    this.world = new World(this.fullBoxWidth, this.fullBoxHeight,
                           settings.gridSpace.x, settings.gridSpace.y);
    this.setupMouseListener();

    // TODO: Avoid this vs that pattern, I don't like it...
    let that = this;


    wizardImg.onload = function() {
      // TODO: Do like a proper frame thingamjig. For now
      // we know it's just a single image
      let frames = [
        { x: 0, y: 0, width: wizardImg.width, height: wizardImg.height},
      ];

      let player = new PlayerUnit(wizardImg, frames, 1, 7, that.fullBoxWidth, that.fullBoxHeight);

      that.world.addObject(player);
      that.view.addDrawable(that.world);

      // TODO: Use promises
      that.start();
    };
  },

  setupMouseListener: function() {
    let that = this;
    this.view.mouse.addEventListener("mousedown", (e) => {
      // convert the x and y coordinates to world coordinates and pass to the
      // world on mouseClick
      let worldCoordinates = this.view.toWorld(e.pageX, e.pageY);
      // only call the world mouse click if the coordinates are in the worlds
      if (worldCoordinates.x < 0 || worldCoordinates.x > this.background.width ||
        worldCoordinates.y < 0 || worldCoordinates.y > this.background.height){
        return;
      }

      this.world.mouseClick(worldCoordinates.x, worldCoordinates.y);
    });
  },

  start: function() {
    this.view.start(this.background);
    this.loop();
  },

  loop: function() {
    that = this;
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
