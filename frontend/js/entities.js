class GridMover {
  constructor(gridX, gridY, gridBoxWidth, gridBoxHeight) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.gridBoxWidth = gridBoxWidth;
    this.gridBoxHeight = gridBoxHeight;
  }

  setGridDimensions(gridBoxWidth, gridBoxHeight) {
    this.gridBoxWidth = gridBoxWidth;
    this.gridBoxHeight = gridBoxHeight
  }
}

class Drawable {
  constructor(imgLoaded, frameData) {
    this.img = imgLoaded;
    this.frameData = frameData;
    this.frameIdx = 0;

    // pointer to current frame
    this.frame = this.frameData[0];
      // let worldData = {

      //   gridX: 1,
      //   gridY: 7,
      // };

      // let drawData = centerImageInGrid(worldData.gridX, worldData.gridY,
      //   that.fullBoxWidth, that.fullBoxHeight,
      //   wizardImg);

      // // TODO: Do like a proper frame thingamjig. For now
      // // we know it's just a single image
      // let frames = [
      //   { x: 0, y: 0, width: wizardImg.width, height: wizardImg.height},
      // ];
      // let wizard = {
      //   img: wizardImg,
      //   drawData: drawData,
      //   frames: frames,
      //   frameIdx: 0,
      //   worldData: worldData,
      // };
      // that.wizard = wizard;

      // that.view.addDrawable(wizard);
      // that.world.addObject(wizard);

      // // TODO: Use promises
      // that.start();
    }

  draw(ctx, x, y, width, height) {
    ctx.drawImage(this.img,
                  this.frame.x, this.frame.y, this.frame.width, this.frame.height,
                  x, y, width, height);
  }
}
