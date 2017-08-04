const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('./searchWingInfosFromEddb');
const normalizeWingInfoFromEddb = require('./normalizeWingInfoFromEddb');
const mongoConnection = require('./mongoConnection');

var exports = {};

exports.execute = function() {
    //Execute every hour
    const j = schedule.scheduleJob('0 * * * *', function(){
        logger.info('[hourlyJob] Hourly job started...');
        searchWingInfosFromEddb.get(function(error, body) {
            if (!error) {
                const data = normalizeWingInfoFromEddb.getInfos(body);
                mongoConnection.saveOrUpdate(data, 'wingData', function(error) {
                    logger.info('[hourlyJob] Hourly job ended...');
                });    
            }
                    
        });
    });
};

module.exports = exports;