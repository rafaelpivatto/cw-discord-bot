const request = require('request');
const logger = require('heroku-logger')

const logName = '[SearchWingInfosFromEddb]';
const wingUrl = 'https://eddb.io/faction/74863';

exports.get = function(logPrefix, callback) {
    logger.info(logPrefix + logName + ' Getting eddb infos on site=' + wingUrl);
    request(wingUrl, function (error, response, body) {
        if (error) {
            logger.error(logPrefix + logName + ' Error to get eddb info', {'error': error});
        }
        if (response && response.statusCode != 200) {
            logger.error(logPrefix + logName + ' response code != 200', response);
            logger.error(logPrefix + logName + ' statusMessage', statusMessage);
        }

        logger.info(logPrefix + logName + ' Finish to get eddb infos');
        callback(error, body);
    });
};

module.exports = exports;