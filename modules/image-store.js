var fn = require("./common/fn");
var fs = require("fs");
var logger = require("./common/logger");

module.exports = ImageStore();

function ImageStore() {
    var images = [], _imagesOld;

    return {
        add: add,
        getLatest: getLatest,
        moveImagesToTargetFolder: moveImagesToTargetFolder
    };

    function add(fileName, timestamp) {
        if (!findImageByPath(fileName, _imagesOld)) {
            logger.debug("new image", fileName);
            images.push(new Image(fileName, timestamp));
        }
    }

    function getLatest() {
        return images[images.length - 1];
    }

    function moveImagesToTargetFolder(targetFolder) {        
        logger.debug("moving temp images to", targetFolder);

        var latest = getLatest();
        _imagesOld = images;
        images = [latest];        

        for (var i = 0; i < _imagesOld.length - 1; i++) {
            var oldImage = _imagesOld[i];
            moveImage(oldImage);
        }

        function moveImage(image) {
            var destination = image.getDestination();
            var folderPath = fn.pathConcat(targetFolder, destination.folderName);

            fn.ensureFolder(folderPath, function (err) {
                if (!err) {
                    var filePath = fn.pathConcat(folderPath, destination.fileName);
                    logger.debug("renaming:", image.fileName, filePath);
                    fs.rename(image.fileName, filePath, (err) => {
                        if (err) logger.error("unable to move file", err);
                    });
                }
            });
        }
    }

    function findImageByPath(path, array) {
        if (array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].fileName === path) return array[i];
            }
        }
        return null;
    }
}

function Image(fileName, timestamp) {
    this.fileName = fileName;
    this.timestamp = timestamp;
}

function ImageDestination(timestamp) {
    var date = new Date(timestamp);
    this.folderName = date.getFullYear() + fn.padNmbr(date.getMonth()) + fn.padNmbr(date.getDate());
    this.fileName = fn.padNmbr(date.getHours()) + "_" + fn.padNmbr(date.getMinutes()) + "_" + fn.padNmbr(date.getSeconds()) + ".jpg";
}

Image.prototype.getDestination = function getDestination() {
    return new ImageDestination(this.timestamp)
};