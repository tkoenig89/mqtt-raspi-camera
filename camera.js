var RaspiCam = require("raspicam");
var fs = require("fs");

module.exports = CameraWrapper;

function CameraWrapper(options) {
    var self = this;
    self.options = initOptions(options);
    self._listeners = [];
    self._camera = new RaspiCam({
        mode: "timelapse",
        output: self.options.root + "img_%d.jpg",
        datetime: true,
        e: "jpg",
        q: 10,
        n: true,
        t: 360000,
        tl: 15000
    });

    self._camera.on("read", function (err, timestamp, filename) {
        if (!err && !filename.endsWith("~")) {
            var filePath = self.options.root + filename;
            for (let i = 0; i < self._listeners.length; i++) {
                setTimeout(self._listeners[i].bind(null, filePath, timestamp), 0);
            }
        }
    });

    self._camera.on("exit",function(){
        console.log("done");
        self._camera.stop();
        self._camera.start();
    });
}

function initOptions(opts) {
    opts = opts || {};
    opts.root = opts.root || ".";
    if (!opts.root.endsWith("/")) opts.root = opts.root + "/";

    return opts;
}

CameraWrapper.prototype.onImageStored = function onImageStored(listener) {
    this._listeners.push(listener);
};

CameraWrapper.prototype.start = function start() {
    this._camera.start();
};

CameraWrapper.prototype.stop = function stop() {
    this._camera.stop();
};

