module.exports = ImageStore();

function ImageStore() {
    var images = [];
    
    return {
        add: add,
        getLatest: getLatest
    };

    function add(fileName) {
        images.push(fileName);
    }

    function getLatest() {
        return images[images.length - 1];
    }
}