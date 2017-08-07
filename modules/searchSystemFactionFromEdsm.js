const request = require('request');
const logger = require('heroku-logger')

const url = 'http://www.edsm.net/api-system-v1/factions?systemName=';

var exports = {};

exports.get = function(systemName, callback) {
    
    logger.info('[searchSystemFactionFromEdsm] Getting system faction infos from edsm by system = ' + systemName);

    request(url + systemName, function (error, response, body) {
        if (error) {
            logger.error('[searchSystemFactionFromEdsm] system faction infos', error);
        }
        if (response && response.statusCode != 200) {
            logger.error('[searchSystemFactionFromEdsm] response code != 200', response);
            logger.error('[searchSystemFactionFromEdsm] statusMessage', statusMessage);
        }
        
        logger.info('[searchSystemFactionFromEdsm] Finish getting system faction infos from edsm');
        callback(error, body);
    });

    
};

module.exports = exports;
