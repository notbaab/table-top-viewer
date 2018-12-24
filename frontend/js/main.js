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
    startX: gridX * boxWidth,
    startY: gridY * boxHeight,
    endX: gridX * boxWidth + boxWidth,
    endY: gridY * boxHeight + boxHeight,
  };
};

function centerImageInGrid(gridX, gridY, boxWidth, boxHeight, img) {
  let gridLoc = gridSpaceToWorld(gridX, gridY, boxWidth, boxHeight);

  let widthScale = img.width / boxWidth;
  let heightScale = img.height / boxHeight;
  let biggerScale = widthScale > heightScale ? widthScale : heightScale;

  let destWidth = img.width / biggerScale;
  let destHeight = img.height / biggerScale;

  // how wide does is the image in comparison to the boxWidth
  let xOffset = (boxWidth - img.width / biggerScale) / 2;
  let yOffset = (boxHeight - img.height / biggerScale) / 2;
  return {
    x: gridLoc.startX + xOffset,
    y: gridLoc.startY + yOffset,
    width: destWidth,
    height: destHeight,
  }
};

function centerGridSpaceToWorld(gridX, gridY, boxWidth, boxHeight) {
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

    // TODO: Avoid this vs that pattern, I don't like it...
    let that = this;

    let wizardImg = new Image();
    wizardImg.src = "img/wizard.png";
    wizardImg.onload = function() {
      // TODO: Generalize this
      let drawData = centerImageInGrid(1, 7, that.fullBoxWidth,
                                       that.fullBoxHeight, wizardImg);

      // TODO: Do like a proper frame thingamjig. For now
      // we know it's just a single image
      let frames = [
        { x: 0, y: 0, width: wizardImg.width, height: wizardImg.height},
      ];
      let wizard = {
        img: wizardImg,
        drawData: drawData,
        frames: frames,
        frameIdx: 0,
      }
      that.wizard = wizard;

      that.view.addDrawable(wizard);
    }
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
