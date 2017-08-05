const fs = require('fs');
const logger = require('heroku-logger')

var exports = {};

exports.loadFile = function(res, fileName) {
    logger.info('[fileManagement] Starting load file = ' + fileName);
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    fs.readFile(dir + fileName, function (err, dt) {
        if (err) {
            logger.error('[fileManagement] Error to load file ');
            return res.status(404).send('Sorry, we cannot find that!');
        }
        logger.info('[fileManagement] File readed!');
        var options = {
            root: dir,
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(fileName, options, function (err) {
            if (err) {
                logger.error('[fileManagement] Error to send file ');
                res.status(404).send('Sorry, we cannot find that!');
            } else {
                logger.info('[fileManagement] File sended!');
            }
        });
    });
};

exports.saveFile = function(body, filePath, callback) {
    logger.info('[fileManagement] Starting save file = ' + filePath);
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    dir = dir + filePath;
    fs.writeFile(dir, body, 'binary', function(error) {
        if(error) {
            logger.error('[fileManagement] Error to save file ');
            callback(error)
        } else {
            logger.info('[fileManagement] File saved!');
            callback(null)
        }
    });
};



module.exports = exports;