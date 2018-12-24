function main(w) {
  w.app = new App();
  w.app.init();
  w.app.setCurrentMap('img/map.jpg');
}

window.onload = function() {
  main(window);
};


function gridSpaceToWorld(gridX, gridY, boxWidth, boxHeight) {
  return {
    x: gridX * boxWidth,
    y: gridY * boxHeight,
  };
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
  // can we draw an avatar at grid 10, 9
  // get the non transform sized of the grid stuff so we can use the
  // toScreen conversion

  this.connection.bind( "connect", this.handleInitialConnection, this );
  this.connection.bind( "message", this.onMessage, this )
};

App.prototype = {
  init: function() {
    console.log("Doing shit")
    this.canvas = document.getElementById(settings.canvasId);
    this.context = this.canvas.getContext('2d');

    // size canvas to the given size
    this.canvas.width = this.windowSize.width;
    this.canvas.height = this.windowSize.height;
  },

  handleInitialConnection: function(msg) {
    console.log("Doing initial connection")
    console.log(msg)
  },

  onMessage: function(msg) {
    console.log("update shit")
    console.log(msg)
  },

  setCurrentMap: function(src) {
    let img = new Image();
    img.src = src;
    let ctx = this.context;
    let that = this;

    img.onload = function() {
      that.background = img;
      that.scaleBackgroundToFull();
      that.view.start(img);
      that.postBackgroundLoad();
    }
  },

  postBackgroundLoad() {
    this.fullBoxWidth = this.background.width / settings.gridSpace.x;
    this.fullBoxHeight = this.background.height / settings.gridSpace.y;
    let location = gridSpaceToWorld(10, 9, this.fullBoxWidth, this.fullBoxHeight);

    let wizardImg = new Image();
    wizardImg.src = "img/wizard.png";

    let wizard = {
      img: wizardImg,
      location: location
    }
    this.wizard = wizard;

    this.view.addDrawable(wizard);
  },

  scaleBackgroundToFull: function() {
    // scales the background to try to fill the entire canvas
    // by picking the dimension that needs to be scaled the most
    let widthScale = this.background.width / this.canvas.width
    let heightScale = this.background.height / this.canvas.height
    let biggerScale = widthScale > heightScale ? widthScale : heightScale;
    this.view.setScale(1 / biggerScale);
  },
}
