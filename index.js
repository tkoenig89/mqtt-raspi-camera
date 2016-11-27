//set logging levels
var logger = require("./modules/logger")
    .setDebug(false)
    .setLog(true)
    .setError(true);

var MqttCameraRunner = require("./modules/mqtt-camera-runner");
var MqttUploader = require("./modules/mqtt-upoad");

//load configuration
var camera_config = require(process.argv[2] || "./config.json");
var mqtt_config = require(process.argv[3] || "./mqtt-config.json");

//setup
var mqttUploader = MqttUploader(mqtt_config);
var runner = MqttCameraRunner(camera_config, mqttUploader);

//start
logger.log("starting up");
runner.go();