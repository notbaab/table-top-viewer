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
  };
}

class World {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.objects = [];
    this.selectedObject = undefined;
  }

  toGrid(x, y) {
    return {
      x: Math.floor(x / this.gridWidth),
      y: Math.floor(y / this.gridHeight),
    };
  }

  addObject(object) {
    this.objects.push(object);
  }

  moveObject(obj, gridX, gridY) {
    obj.drawData = centerImageInGrid(gridX, gridY, this.gridWidth, this.gridHeight, obj.img);
    obj.worldData = {
      gridX: gridX,
      gridY: gridY,
    }
  }

  selectObject(obj) {
    this.selectedObject = obj;
  }

  unselectObject(obj) {
    this.selectedObject = undefined;
  }

  mouseClick(x, y) {
    let grid = this.toGrid(x, y);

    if (this.selectedObject &&
      this.selectedObject.worldData.gridX === grid.x &&
      this.selectedObject.worldData.gridY === grid.y ){
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
        if (obj.worldData.gridX === grid.x && obj.worldData.gridY === grid.y) {
          this.selectedObject = obj;
        }
      }
    }
  }
}
