const fs = require('fs');

var exports = {};

exports.loadFile = function(res, fileName) {
    var dir = __dirname.replace('\\modules', '');
    fs.readFile(dir + fileName, function (err, dt) {
        if (err) return res.status(404).send('Sorry, we cannot find that!');

        var options = {
            root: dir,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(fileName, options, function (err) {
            if (err) {
                res.status(404).send('Sorry, we cannot find that!');
            }
        });
    });
};



module.exports = exports;