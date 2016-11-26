var fn = require("./fn");
var gm = require('gm');
var logger = require("./logger");
var mqttConfig = require("./mqtt-config.json");
var MqttClient = require("./mqtt-publishing-client");
var client = MqttClient(mqttConfig);
var lastTimestamp = 0;

module.exports = {
    publishImage: publishImage
};

function publishImage(image) {
    //only publish the latest images
    if (image.timestamp > lastTimestamp) {
        lastTimestamp = image.timestamp;

        gm(image.fileName).resize(1280, 960).toBuffer((err, buffer) => {
            if (err) return logger.error(err);
            var payload = createMqttPayload(image, buffer);

            logger.debug("publishing grayscale image...");
            client.publish(mqttConfig.topic, payload, { qos: mqttConfig.qos });
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