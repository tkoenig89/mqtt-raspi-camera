require("./logger").setDebug(true);
var MqttCameraRunner = require("./mqtt-camera-runner");
var MqttUploader = require("./mqtt-upoad");

//load configuration
var camera_config = require("./config.json");
var mqtt_config = require("./mqtt-config.json");

//setup
var mqttUploader = MqttUploader(mqtt_config);
var runner = MqttCameraRunner(camera_config, mqttUploader);

//start
runner.go();