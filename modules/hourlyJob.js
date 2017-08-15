const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('./searchWingInfosFromEddb');
const normalizeWingInfoFromEddb = require('./normalizeWingInfoFromEddb');
const mongoConnection = require('./mongoConnection');

const logName = '[HourlyJob]';

var exports = {};

exports.execute = function() {
    //Execute every hour
    const j = schedule.scheduleJob('0 * * * *', function(){
        logger.info(logName + ' Hourly job started...');
        searchWingInfosFromEddb.get(logName, function(error, body) {
            if (!error) {
                const data = normalizeWingInfoFromEddb.getInfos(logName, body);
                mongoConnection.saveOrUpdate(logName, data, 'wingData', function(error) {
                    logger.info(logName + ' Hourly job ended...');
                });    
            }
                    
        });
    });
};

module.exports = exports;