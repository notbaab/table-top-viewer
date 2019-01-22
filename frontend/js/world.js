class World {
  constructor() {
    this.objects = [];
    this.background = undefined;
    this.selectedObject = undefined;
  }

  setNewGridBox(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // width in pixels
    this.gridBoxWidth = this.background.width / this.gridWidth;
    this.gridBoxHeight = this.background.height / this.gridHeight;

    this.pixelWidth = this.gridWidth * this.gridBoxWidth;
    this.pixelHeight = this.gridHeight * this.gridBoxHeight;

    for (var i = 0; i < this.objects.length; i++) {
      this.objects[i].setGridDimensions(this.gridBoxWidth, this.gridBoxHeight);
    }
  }

  setNewBackground(img) {
    this.background = img;
  }

  toGrid(x, y) {
    return {
      x: Math.floor(x / this.gridBoxWidth),
      y: Math.floor(y / this.gridBoxHeight),
    };
  }

  // This draws everything. Slow but we don't do it that much...
  draw(ctx, startX, endX, startY, endY) {
    // draw the background first
    ctx.drawImage(this.background, 0, 0);

    if (startX !== undefined) {
      // drawing a subset of the world
    }

    // draw the objects
    for (var i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i]
      // give the objects location or let them decide?
      obj.draw(ctx);
    }
    //
    this.drawGridOverlay(ctx);
  }

  // Draws a grid with width and height with the number of horizontal and
  // vertical boxes. Doesn't assume width and height will be the same so
  // can result in elongated boxes
  drawGridOverlay(ctx) {
    for (var x = 0; x <= this.pixelWidth; x += this.gridBoxWidth) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, this.pixelHeight);
    }

    for (var y = 0; y <= this.pixelHeight; y += this.gridBoxHeight) {
      ctx.moveTo(0, 0.5 + y);
      ctx.lineTo(this.pixelWidth, 0.5 + y);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  addObject(object) {
    this.objects.push(object);
  }

  addPlayerUnit(state, loadedImage) {
    let frames = [
      { x: 0, y: 0, width: loadedImage.width, height: loadedImage.height},
    ];

    let player = new PlayerUnit(loadedImage, frames, state.location[0], state.location[1],
                                this.gridBoxWidth, this.gridBoxHeight);
    this.addObject(player);
  }

  moveObject(obj, gridX, gridY) {
    obj.gridX = gridX;
    obj.gridY = gridY;
  }

  selectObject(obj) {
    this.selectedObject = obj;
  }

  unselectObject(obj) {
    this.selectedObject = undefined;
  }

  mouseClick(x, y) {
    let grid = this.toGrid(x, y);
    console.log("Selecting");

    if (this.selectedObject &&
      this.selectedObject.gridX === grid.x &&
      this.selectedObject.gridY === grid.y ){
      // clicking in the same spot, unselect object
      this.unselectObject(this.selectedObject);
    } else if (this.selectedObject) {
      // have a selected object, move it to the place we are clicking
      this.moveObject(this.selectedObject, grid.x, grid.y);
      this.selectedObject = undefined;
    } else {
      // select an object
      for (var i = 0; i < this.objects.length; i++) {
        let obj = this.objects[i];
        if (obj.gridX === grid.x && obj.gridY === grid.y) {
          this.selectedObject = obj;
        }
      }
    }
  }
}
