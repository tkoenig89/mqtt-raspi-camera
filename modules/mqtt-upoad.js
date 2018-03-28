var fn = require("./common/fn");
var gm = require('gm');
var fs = require('fs');
var logger = require("./common/logger");
var MqttClient = require("./mqtt-publishing-client");

module.exports = MqttUploader;

function MqttUploader(mqttConf, cameraConf) {
    var lastTimestamp = 0;
    var imgWidth = cameraConf && cameraConf.imageSendWidth || 1280;
    var imgHeight = cameraConf && cameraConf.imageSendHeight || 960;

    //add last will
    mqttConf.will = {
        topic: "stall/" + mqttConf.identifier + "/isOnline",
        payload: "no", qos: 1, retain: true
    };

    //set retain
    mqttConf.retain = !!mqttConf.retain;

    //connect
    var client = MqttClient(mqttConf);

    //send online status
    client.publish(mqttConf.will.topic, "yes", { qos: 1, retain: true });

    return {
        publishImage: publishImage,
        publishRawImage: publishRawImage,
        close: close
    };

    function close(){
        client.close();
    }

    function publishImage(image) {
        //only publish the latest images
        if (image.timestamp > lastTimestamp) {
            lastTimestamp = image.timestamp;

            gm(image.fileName).resize(imgWidth, imgHeight).toBuffer((err, buffer) => {
                if (err) return logger.error(err);
                var payload = createMqttPayload(image, buffer);

                logger.debug("publishing", image.fileName, "via mqtt");
                try {
                    client.publish(mqttConf.topic, payload, { qos: mqttConf.qos, retain: mqttConf.retain });
                } catch (ex) {
                    logger.error("catched", ex);
                }
            });
        }
    }

    function publishRawImage(image, callback) {
        if (image.timestamp > lastTimestamp) {
            lastTimestamp = image.timestamp;

            fs.readFile(image.fileName, function (err, buffer) {
                if (err) return logger.error(err);
                var payload = createMqttPayload(image, buffer);

                logger.debug("publishing", image.fileName, "via mqtt");
                try {
                    client.publish(mqttConf.topic, payload, { qos: mqttConf.qos, retain: mqttConf.retain }, callback);
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