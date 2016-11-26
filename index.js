var Camera = require("./camera");
var imageStore = require("./image-store");

var cam = new Camera({
    root: "/mnt/usb/testimages"
});

cam.onImageStored(onImageSaved);
cam.start();

function onImageSaved(filename, timestamp) {
    console.log(filename, timestamp);
    imageStore.add(filename, timestamp);
}