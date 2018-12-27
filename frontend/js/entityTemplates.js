// Where should this go!?!?!?!
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
  };
}

function gridSpaceToWorld(gridX, gridY, boxWidth, boxHeight) {
  return {
    startX: gridX * boxWidth,
    startY: gridY * boxHeight,
    endX: gridX * boxWidth + boxWidth,
    endY: gridY * boxHeight + boxHeight,
  };
};

class PlayerUnit {
  constructor(img, frameData, gridX, gridY, gridBoxWidth, gridBoxHeight) {
    this.components = [
      new Drawable(img, frameData),
      new GridMover(gridX, gridY, gridBoxWidth, gridBoxHeight),
    ];
    this.properties = {
      type: "PlayerUnit",
    };
    this.overload = {"update":{}, "draw":{}};       // list of functions or properties that exist in multiple components

    createEntityFromTemplate(this);   // utility.js
  }

  draw(ctx) {
    // this knows how to center itself and call the given draw function
    let drawData = centerImageInGrid(this.gridX, this.gridY, this.gridBoxWidth, this.gridBoxHeight, this.img);
    this.overload.draw.Drawable(ctx, drawData.x, drawData.y, drawData.width, drawData.height);
  }
}
