const request = require('request');
const logger = require('heroku-logger')

const logName = '[SearchSystemFactionFromEdsm]';

let url = 'http://www.edsm.net/api-system-v1/factions?systemName=';

exports.get = function(logPrefix, systemName, callback) {
    
    logger.info(logPrefix + logName + ' Getting system faction infos from edsm by system = ' + systemName);
    const finalUrl = url + systemName;
    request(finalUrl, function (error, response, body) {
        if (error) {
            logger.error(logPrefix + logName + ' error to get system faction infos by url: ' + finalUrl, 
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
        
        logger.info(logPrefix + logName + ' Finish getting system faction infos from edsm');
        callback(error, body, finalUrl);
    });
    
};

module.exports = exports;
