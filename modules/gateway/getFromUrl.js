const request = require('request');
const logger = require('heroku-logger')

const logName = '[getFromUrl]';

let cookieJar = request.jar();

exports.do = function(logPrefix, options, isJson, callback) {
    if (!options) {
        options = {};
    }
    options.jar = cookieJar;
    logger.info(`${logPrefix} ${logName} Request with options= ${JSON.stringify(options)}`);
    
    request(options, function (error, response, body) {
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
        const dataReturned = isJson ? JSON.parse(body) : body;
        callback(error, dataReturned);
    });
};

exports.get = function(logPrefix, url, callback) {
    
    logger.info(logPrefix + logName + ' Getting from url = ' + url);
    const options = {
        method: 'GET',
        url: url
    };
    exports.do(logPrefix, options, true, callback);
};

exports.getHtml = function(logPrefix, url, callback) {
    
    logger.info(logPrefix + logName + ' Getting from url = ' + url);
    const options = {
        method: 'GET',
        url: url
    };
    exports.do(logPrefix, options, false, callback);
};

module.exports = exports;
