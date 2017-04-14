var imageStore = require("../modules/image-store");
var MqttCameraRunner = require("../modules/mqtt-camera-runner");
var MqttUploader = require("../modules/mqtt-upoad");

//set logging levels
var logger = require("../modules/common/logger")
    .setDebug(false)
    .setLog(false)
    .setError(true);

//load configuration
var camera_config = require(process.argv[2] || "./config.json");
var mqtt_config = require(process.argv[3] || "./mqtt-config.json");

//setup
var mqttUploader = MqttUploader(mqtt_config, camera_config);

//simulate sending one image
imageStore.add("18_08_19.jpg", Date.now());
var image = imageStore.getLatest();
mqttUploader.publishRawImage(image, () => {
    mqttUploader.close();
});

