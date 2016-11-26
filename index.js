require("./logger").setDebug(true);
var config = require("./config.json");
var MqttCameraRunner = require("./mqtt-camera-runner");

//configure
var runner = MqttCameraRunner(config);

//start
runner.go();