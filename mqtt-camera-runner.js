var fn = require("./fn");
var Camera = require("./camera");
var imageStore = require("./image-store");
var mqttUploader = require("./mqtt-upoad");
var logger = require("./logger");
var cam;

module.exports = MqttCameraRunner;

function MqttCameraRunner(opts) {
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
            root: tempFolder
        });

        //add listeners
        cam.onImageStored(onImageSaved);
        cam.onFinished(onFinished);

        //start camera
        cam.start();

        setInterval(function () {
            var latestImg = imageStore.getLatest();
            logger.log("latest", latestImg);
            mqttUploader.publishImage(latestImg);
        }, opts.publishInterval);
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
