const request = require('request');
const logger = require('heroku-logger')

let url = 'http://www.edsm.net/api-system-v1/factions?systemName=';

var exports = {};

exports.get = function(systemName, callback) {
    
    logger.info('[searchSystemFactionFromEdsm] Getting system faction infos from edsm by system = ' + systemName);
    const finalUrl = url + systemName;
    request(finalUrl, function (error, response, body) {
        if (error) {
            logger.error('[searchSystemFactionFromEdsm] error to get system faction infos by url: ' + finalUrl, 
                        {'error': error});
        }
        if (response && response.statusCode != 200) {
            logger.error('[searchSystemFactionFromEdsm] response code != 200', response);
            logger.error('[searchSystemFactionFromEdsm] statusMessage', statusMessage);
        }
        
        logger.info('[searchSystemFactionFromEdsm] Finish getting system faction infos from edsm');
        callback(error, body, finalUrl);
    });

    
};

module.exports = exports;
