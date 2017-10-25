const logger = require('heroku-logger');

const getFromUrl = require('../gateway/getFromUrl');

const logName = '[getServerStatusFromEdsm]';
const url = 'https://www.edsm.net/api-status-v1/elite-server';

exports.getServerStatus = function(logPrefix, callback) {
    logger.info(logPrefix + logName + ' Starting get server status');

    getFromUrl.get(logPrefix, url, function(error, body){
        callback(error, body);
    });
};

module.exports = exports;