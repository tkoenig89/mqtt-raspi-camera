var gm = require('gm');

gm(filename).resize(100).write(filename.replace(".jpg", "_sm.jpg"), function (err) {
    if (err) console.log(err);
});