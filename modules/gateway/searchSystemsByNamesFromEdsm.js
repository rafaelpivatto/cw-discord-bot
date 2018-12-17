const request = require('request');
const logger = require('heroku-logger')

const getFromUrl = require('./getFromUrl.js');
const utils = require('../utils.js');

const logName = '[SearchSystemFactionFromEdsm]';

exports.getSystemCoordinates = function(logPrefix, systemNames) {
    
    logger.info(`${logPrefix}${logName} Getting system coordinates from edsm by systems =${systemNames}`);
    
    return new Promise((resolve, reject) => {
        let url = 'https://www.edsm.net/api-v1/systems?showCoordinates=1';
        for(let name of systemNames) {
            let systemName = utils.removeDiacritics(String(name));
            systemName = systemName.toUpperCase();
            url += `&systemName[]=${systemName}`;
        }
        getFromUrl.get(logPrefix, url, function (error, response) {
            if (error || !response) {
                logger.error(`${logPrefix}${logName} error to get systems coordinates by url: ${url}`, JSON.stringify(error));
                reject(error);
            }
            
            logger.info(`${logPrefix}${logName} Finished to get system coordinates from edsm`, response);
            resolve(response);
        });
    });

    
    
};

module.exports = exports;
