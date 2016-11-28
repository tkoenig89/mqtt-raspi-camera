var fn = require("./fn");
var gm = require('gm');
var logger = require("./logger");
var MqttClient = require("./mqtt-publishing-client");

module.exports = MqttUploader;

function MqttUploader(opts) {
    var lastTimestamp = 0;

    //add last will
    opts.will = {
        topic: "stall/" + opts.identifier + "/isOnline",
        payload: "no", qos: 1, retain: true
    };

    //connect
    var client = MqttClient(opts);

    //send online status
    client.publish(opts.will.topic, "yes", { qos: 1, retain: true });

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
                try {
                    client.publish(opts.topic, payload, { qos: opts.qos });
                } catch (ex) {
                    logger.error("catched", ex);
                }
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