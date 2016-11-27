var RaspiCam = require("raspicam");
var fs = require("fs");
var logger = require("./logger");

module.exports = CameraWrapper;

function CameraWrapper(options) {
    var self = this;
    self.options = initOptions(options);
    self._imageListeners = [];
    self._finishListeners = [];
    self._camera = new RaspiCam({
        log: logger.debug,
        w: 2592,
        h: 1944,
        mode: "timelapse",
        output: self.options.root + "%d." + self.options.encoding,
        timestamp: true,
        e: self.options.encoding,
        th: "none",
        q: 10,
        n: true,
        t: options.tempToStorageInterval || 300000, //5min
        tl: options.imageInterval || 15000  //15sec
    });

    self._camera.on("read", function (err, timestamp, filename) {
        if (!err && !filename.endsWith("~")) {
            var filePath = self.options.root + filename;
            for (let i = 0; i < self._imageListeners.length; i++) {
                setTimeout(self._imageListeners[i].bind(null, filePath, timestamp), 0);
            }
        }
    });

    self._camera.on("exit", function () {
        self._camera.stop();
        for (let i = 0; i < self._finishListeners.length; i++) {
            setTimeout(self._finishListeners[i], 0);
        }
    });
}

function initOptions(opts) {
    opts = opts || {};
    opts.root = opts.root || ".";
    opts.encoding = opts.encoding || "jpg";
    if (!opts.root.endsWith("/")) opts.root = opts.root + "/";

    return opts;
}

CameraWrapper.prototype.onImageStored = function onImageStored(listener) {
    this._imageListeners.push(listener);
};

CameraWrapper.prototype.onFinished = function onFinished(listener) {
    this._finishListeners.push(listener);
};

CameraWrapper.prototype.start = function start() {
    this._camera.start();
};

CameraWrapper.prototype.stop = function stop() {
    this._camera.stop();
};

