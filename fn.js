var fs = require("fs");
var debugLog = require("./logger").debug;

module.exports = {
    padNmbr: padNmbr,
    pathConcat: pathConcat,
    getFileExtension: getFileExtension,
    ensureFolder: ensureFolder,
    deleteFolderRecursive: deleteFolderRecursive
};

/**
 * Adds a leading '0' in front of all numbers < 10
 * @param {number} num
 * @returns {string}
 */
function padNmbr(num) {
    return (num < 10 ? "0" : "") + num.toString();
}

/**
 * Concatenates the two paths given. Path2 must not start with '/'!
 * @param {string} path1
 * @param {string} path2
 * @returns {string}
 */
function pathConcat(path1, path2) {
    return path1 + (path1.endsWith("/") ? "" : "/") + path2;
}

function ensureFolder(folderPath, callback) {
    fs.exists(folderPath, (doesExist) => {
        debugLog(folderPath, doesExist);
        if (!doesExist) {
            fs.mkdir(folderPath, callback);
        } else {
            callback();
        }
    });
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


/**
 * Extracts the file extension from the given path
 * @param {string} filePath
 * @returns {string}
 */
function getFileExtension(filePath) {
    return filePath.substr(filePath.lastIndexOf(".") + 1)
}