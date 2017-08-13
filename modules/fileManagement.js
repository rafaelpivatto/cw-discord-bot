const fs = require('fs');
const mkdirp = require('mkdirp');
const logger = require('heroku-logger');

var exports = {};

exports.loadFile = function(res, fileName) {
    logger.info('[fileManagement] Starting load file = ' + fileName);
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    fs.readFile(dir + fileName, function (error, dt) {
        if (error) {
            logger.error('[fileManagement] Error to load file ', {'error': error});
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
        res.sendFile(fileName, options, function (error) {
            if (error) {
                logger.error('[fileManagement] Error to send file ', {'error': error});
                res.status(404).send('Sorry, we cannot find that!');
            } else {
                logger.info('[fileManagement] File sended!');
            }
        });
    });
};

exports.saveFile = function(body, fileDir, fileName, callback) {
    logger.info('[fileManagement] Starting save file = ' + fileDir + fileName);
    
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    dir = dir + fileDir;

    verifyDir(dir, function(error){
        if(error) {
            logger.error('[fileManagement] Error to create directory: ' + dir, {'error': error});
            callback(error);
        }
        dir = dir + fileName;
        var options = { encoding: 'binary', flag : 'w' };
        fs.writeFile(dir, body, options, function(error) {
            if(error) {
                logger.error('[fileManagement] Error to save file ', {'error': error});
                callback(error)
            } else {
                logger.info('[fileManagement] File saved!');
                callback(null)
            }
        });
        
    });    
};

function verifyDir(dir, callback) {
    mkdirp(dir, function (error) {
        if (error) {
            logger.error('[fileManagement] Error to create directory: ' + dir);
            callback(error);
        } else {
            logger.info('[fileManagement] Directory created or exists');
            callback(null);
        }
    });
}


module.exports = exports;