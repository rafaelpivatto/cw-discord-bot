const fs = require('fs');
const mkdirp = require('mkdirp');
const logger = require('heroku-logger');

const logName = '[FileManagement] ';

var exports = {};

exports.loadFile = function(logPrefix, res, fileName) {
    logger.info(logPrefix + logName + ' Starting load file = ' + fileName);
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    fs.readFile(dir + fileName, function (error, dt) {
        if (error) {
            logger.error(logPrefix + logName + ' Error to load file ', {'error': error});
            return res.status(404).send('Desculpe, essa imagem não está mais disponível!');
        }
        logger.info(logPrefix + logName + ' File readed!');
        var options = {
            root: dir,
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(fileName, options, function (error) {
            if (error) {
                logger.error(logPrefix + logName + ' Error to send file ', {'error': error});
                res.status(404).send('Sorry, we cannot find that!');
            } else {
                logger.info(logPrefix + logName + ' File sended!');
            }
        });
    });
};

exports.saveFile = function(logPrefix, body, fileDir, fileName, callback) {
    logger.info(logPrefix + logName + ' Starting save file = ' + fileDir + fileName);
    
    let dir = __dirname.replace('\\modules', '');
    dir = dir.replace('/modules', '');
    dir = dir + fileDir;

    verifyDir(logPrefix, dir, function(error){
        if(error) {
            logger.error(logPrefix + logName + ' Error to create directory: ' + dir, {'error': error});
            callback(error);
        }
        dir = dir + fileName;
        var options = { encoding: 'binary', flag : 'w' };
        fs.writeFile(dir, body, options, function(error) {
            if(error) {
                logger.error(logPrefix + logName + ' Error to save file ', {'error': error});
                callback(error)
            } else {
                logger.info(logPrefix + logName + ' File saved!');
                callback(null)
            }
        });
        
    });    
};

function verifyDir(logPrefix, dir, callback) {
    mkdirp(dir, function (error) {
        if (error) {
            logger.error(logPrefix + logName + ' Error to create directory: ' + dir);
            callback(error);
        } else {
            logger.info(logPrefix + logName + ' Directory created or exists');
            callback(null);
        }
    });
}


module.exports = exports;