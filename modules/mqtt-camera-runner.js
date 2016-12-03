var fn = require("./fn");
var Camera = require("./camera");
var imageStore = require("./image-store");
var SkipHours = require("skiphours");
var logger = require("./logger");
var cam;

module.exports = MqttCameraRunner;

function MqttCameraRunner(opts, mqttUploader) {
    var tempFolder = fn.pathConcat(opts.root, "temp_imgs");

    return {
        go: go
    };

    function go() {
        init((err) => {
            if (err) return logger.error(err);
            main();
        });
    }

    function init(callback) {
        //recreate the tempory folder
        fn.deleteFolderRecursive(tempFolder);
        fn.ensureFolder(tempFolder, callback);
    }

    function main() {
        cam = new Camera({
            root: tempFolder,
            imageInterval: opts.imageInterval,
            tempToStorageInterval: opts.tempToStorageInterval,
            encoding: opts.encoding
        });

        //add listeners
        cam.onImageStored(onImageSaved);
        cam.onFinished(onFinished);

        //start camera
        cam.start();

        //setup a function wrapper to only send images at specific times
        var repeatOnlyAtSpecificHours = SkipHours(() => {
            var latestImg = imageStore.getLatest();
            mqttUploader.publishImage(latestImg);
        }, opts.hours || "!");

        //set interval to publish images
        setInterval(repeatOnlyAtSpecificHours, opts.publishInterval);
    }

    function onImageSaved(filename, timestamp) {
        imageStore.add(filename, timestamp);
    }

    function onFinished() {
        imageStore.moveImagesToTargetFolder(opts.target);
        logger.debug("starting over");
        cam.start();
    }
}
