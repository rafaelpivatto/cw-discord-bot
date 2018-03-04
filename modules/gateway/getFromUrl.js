const request = require('request');
const logger = require('heroku-logger')

const logName = '[getFromUrl]';

exports.get = function(logPrefix, url, callback) {
    
    logger.info(logPrefix + logName + ' Getting from url = ' + url);
    request(url, function (error, response, body) {
        if (error) {
            logger.error(logPrefix + logName + ' error to get server status by url: ' + url, 
                        {'error': error});
            callback(error);
            return;
        }
        if (response && response.statusCode != 200) {
            logger.error(logPrefix + logName + ' response code != 200', response.statusCode);
            logger.error(logPrefix + logName + ' statusMessage', response.body);
            callback('Error on status code: ' + response.statusCode);
            return;
        }
        
        logger.info(logPrefix + logName + ' Finish getting data from url');
        callback(error, JSON.parse(body));
    });
    
};

exports.getHtml = function(logPrefix, url, callback) {
    
    logger.info(logPrefix + logName + ' Getting from url = ' + url);
    request(url, function (error, response, body) {
        if (error) {
            logger.error(logPrefix + logName + ' error to get server status by url: ' + url, 
                        {'error': error});
            callback(error);
            return;
        }
        if (response && response.statusCode != 200) {
            logger.error(logPrefix + logName + ' response code != 200', response.statusCode);
            logger.error(logPrefix + logName + ' statusMessage', response.body);
            callback('Error on status code: ' + response.statusCode);
            return;
        }
        
        logger.info(logPrefix + logName + ' Finish getting data from url');
        callback(error, body);
    });
    
};

module.exports = exports;
