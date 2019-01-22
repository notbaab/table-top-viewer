class ImageLoader {
  constructor() {
    this.imageCache = {}
  }

  getImage(url) {
    let that = this;
    if (this.imageCache[url] !== undefined) {
        return new Promise(function(resolve) {
            // Do I need to copy this? Idk javascript that wellG
            resolve(this.imageCache[url]);
        });
    }

    return new Promise(function(resolve, reject) {
        var img = new Image()
        img.onload = function() {
            that.imageCache[url] = img;
            resolve(img)
        }
        img.onerror = function() {
            reject(img)
        }
        img.src = url
    });
  }
}
