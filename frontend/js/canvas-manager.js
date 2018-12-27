function Drag(mouse, view) {
  this.dragging = false;
  this.lastX = 0;
  this.lastY = 0;
  this.mouse = mouse;
  this.view = view;
}

Drag.prototype.update = function () {
  var dx, dy;
  if (this.mouse.w) {
    if (this.mouse.w < 0) {
      this.mouse.w += 10;
      this.view.scaleAt(this.mouse.x, this.mouse.y, 1 / 1.02);
      if (this.mouse.w > 0) {
        this.mouse.w = 0;
      }
    } else if (this.mouse.w > 0) {
      this.mouse.w -= 10;
      this.view.scaleAt(this.mouse.x, this.mouse.y, 1.02);
      if (this.mouse.w < 0) {
        this.mouse.w = 0;
      }
    }
  }

  if (this.mouse.buttonRaw) {
    if (!this.dragging) {
      this.dragging = true;
      this.lastX = this.mouse.x;
      this.lastY = this.mouse.y;
    } else {
      if (this.mouse.buttonRaw & 1) {
        dx = this.mouse.x - this.lastX;
        dy = this.mouse.y - this.lastY;
        this.lastX = this.mouse.x;
        this.lastY = this.mouse.y;
        this.view.movePos(dx, dy);
      }
    }
  } else {
    if (this.dragging) {
      this.dragging = false;
    }
  }
};

function Mouse() {
  this.x = 0;
  this.y = 0;
  this.w = 0; // mouse position and wheel
  // mouse modifiers
  this.alt = false;
  this.shift = false;
  this.ctrl = false;
  this.buttonRaw = 0;
  this.over = false; // true if mouse over the element
  this.buttonOnMasks = [0b1, 0b10, 0b100]; // mouse button on masks
  this.buttonOffMasks = [0b110, 0b101, 0b011]; // mouse button off masks
  this.active = false;
  this.bounds = null;
  this.eventNames = "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",");
  this.listeners = {};
}

Mouse.prototype = {
  event(e) {
    var t = e.type;
    this.bounds = this.element.getBoundingClientRect();
    this.x = e.pageX - this.bounds.left;
    this.y = e.pageY - this.bounds.top;
    this.alt = e.altKey;
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey;
    if (t === "mousedown") {
      this.buttonRaw |= this.buttonOnMasks[e.which - 1];
    } else if (t === "mouseup") {
      this.buttonRaw &= this.buttonOffMasks[e.which - 1];
    } else if (t === "mouseout") {
      this.over = false;
    } else if (t === "mouseover") {
      this.over = true;
    } else if (t === "mousewheel") {
      this.w = e.wheelDelta;
      e.preventDefault();
    } else if (t === "DOMMouseScroll") {
      this.w = -e.detail;
      e.preventDefault();
    }

    if (this.listeners[t]) {
      for (var i = 0; i < this.listeners[t].length; i++) {
        this.listeners[t][i](e);
      }
    }
  },

  start(element) {
    this.element = element === undefined ? document : element;
    this.eventNames.forEach(name => document.addEventListener(name, this.event.bind(this)));
    // Don't allow right clicks
    document.addEventListener("contextmenu", (e) => e.preventDefault(), false);
    this.active = true;
  },

  addEventListener(eventName, func) {
    if(!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(func);
  },
};

function View(canvas) {
  this.matrix = [1, 0, 0, 1, 0, 0]; // current view transform
  this.invMatrix = [1, 0, 0, 1, 0, 0]; // current inverse view transform
  this.m = this.matrix; // alias
  this.im = this.invMatrix; // alias
  this.rotate = 0; // current x axis direction in radians
  this.scale = 1; // current scale
  this.pos = { // current position of origin
    x: 0,
    y: 0,
  };
  this.dirty = true;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.mouse = new Mouse();
  this.drag = new Drag(this.mouse, this);
  this.drawables = [];
}

View.prototype = {
  start(img) {
    this.mouse.start(this.canvas);
    this.img = img;
    // resizeCanvas();
    // window.addEventListener("resize", resizeCanvas);
  },

  addDrawable(drawable) {
    this.drawables.push(drawable);
  },

  display() { // call once per frame
    this.drag.update();
    if(!this.dirty) {
      return;
    }
    console.log("drawing display");
    // clear the canvas
    this.canvas.width = this.canvas.width;

    // draw the world
    this.drawWorld();
  },

  // Resets the transform, applies the current transform to the context,
  // calls draw on all the drawable etities with the transformed context,
  // then resets the transform back.
  drawWorld() {
    this.ctx.resetTransform(); // reset transform
    this.ctx.globalAlpha = 1; // reset alpha

    this.apply(this.ctx);

    // draw the background image first.
    // TODO: Should we move this to world as well?
    this.ctx.drawImage(this.img, 0, 0);

    // Loop over the drawables and call draw.
    for (var i = 0; i < this.drawables.length; i++) {
      // TODO: Determine how to filter out objects not in the view port
      this.drawables[i].draw(this.ctx);
    }

    this.ctx.resetTransform(); // reset transform
  },

  apply(ctx) {
    if (this.dirty) {
      this.update();
    }
    var m = this.matrix;
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  },

  update() { // call to update transforms
    var xdx = Math.cos(this.rotate) * this.scale;
    var xdy = Math.sin(this.rotate) * this.scale;
    this.m[0] = xdx;
    this.m[1] = xdy;
    this.m[2] = -xdy;
    this.m[3] = xdx;
    this.m[4] = this.pos.x;
    this.m[5] = this.pos.y;
    // calculate the inverse transformation
    let cross = this.m[0] * this.m[3] - this.m[1] * this.m[2];
    this.im[0] = this.m[3] / cross;
    this.im[1] = -this.m[1] / cross;
    this.im[2] = -this.m[2] / cross;
    this.im[3] = this.m[0] / cross;
    this.dirty = false;
  },

  toWorld(x, y, point = {}) { // convert screen to world coords
    let xx, yy;
    if (this.dirty) {
      this.update();
    }
    xx = x - this.matrix[4];
    yy = y - this.matrix[5];
    point.x = xx * this.im[0] + yy * this.im[2];
    point.y = xx * this.im[1] + yy * this.im[3];
    return point;
  },

  toScreen(x, y, point = {}) { // convert world coords to  coords
    if (this.dirty) {
      this.update();
    }
    point.x = x * this.m[0] + y * this.m[2] + this.m[4];
    point.y = x * this.m[1] + y * this.m[3] + this.m[5];
    return point;
  },

  movePos(x, y) {
    this.pos.x += x;
    this.pos.y += y;
    this.dirty = true;
  },

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.dirty = true;
  },

  setScale(sc) {
    this.scale = sc;
    this.dirty = true;
  },

  scaleScale(sc) {
    this.scale *= sc;
    this.dirty = true;
  },

  scaleAt(x, y, sc) {
    if (this.dirty) {
      this.update();
    }
    this.scale *= sc;
    this.pos.x = x - (x - this.pos.x) * sc;
    this.pos.y = y - (y - this.pos.y) * sc;
    this.dirty = true;
  }
};
