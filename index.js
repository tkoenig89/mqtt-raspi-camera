var MqttCameraRunner = require("./mqtt-camera-runner");

//configure
var runner = MqttCameraRunner({
    root: "/mnt/usb/images",
    target: "/mnt/usb/images/history"
});

//start
runner.go();