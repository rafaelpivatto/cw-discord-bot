const request = require('request');
const logger = require('heroku-logger')

const wingUrl = 'https://eddb.io/faction/74863';

var exports = {};

exports.get = function(callback) {
    logger.info('[searchWingInfosFromEddb] Getting eddb infos on site=' + wingUrl);
    request(wingUrl, function (error, response, body) {
        if (error) {
            logger.error('[searchWingInfosFromEddb] Error to get eddb info', error);
        }
        if (response && response.statusCode != 200) {
            logger.error('[searchWingInfosFromEddb] response code != 200', response);
            logger.error('[searchWingInfosFromEddb] statusMessage', statusMessage);
        }

        logger.info('[searchWingInfosFromEddb] Finish to get eddb infos');
        callback(error, body);
    });
};

module.exports = exports;