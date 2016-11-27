var fn = require("./fn");
var gm = require('gm');
var logger = require("./logger");
var MqttClient = require("./mqtt-publishing-client");

module.exports = MqttUploader;

function MqttUploader(opts) {
    var client = MqttClient(opts);
    var lastTimestamp = 0;

    return {
        publishImage: publishImage
    };


    function publishImage(image) {
        //only publish the latest images
        if (image.timestamp > lastTimestamp) {
            lastTimestamp = image.timestamp;

            gm(image.fileName).resize(1280, 960).toBuffer((err, buffer) => {
                if (err) return logger.error(err);
                var payload = createMqttPayload(image, buffer);

                logger.log("publishing", image.fileName, "via mqtt");
                client.publish(opts.topic, payload, { qos: opts.qos });
            });
        }
    }

    function createMqttPayload(image, buffer) {
        var meta = {
            time: new Date(image.timestamp),
            ext: fn.getFileExtension(image.fileName)
        };

        return JSON.stringify(meta) + ";#" + buffer.toString("base64");
    }
}