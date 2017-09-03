const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('../gateway/searchWingInfosFromEddb.js');
const normalizeWingInfoFromEddb = require('../service/normalizeWingInfoFromEddb.js');
const mongoConnection = require('../connection/mongoConnection.js');;

const logName = '[HourlyJob]';

var exports = {};

exports.execute = function() {
    //Execute every hour
    const j = schedule.scheduleJob('0 * * * *', function(){
        logger.info(logName + ' Job started...');
        searchWingInfosFromEddb.get(logName, function(error, body) {
            if (!error) {
                const data = normalizeWingInfoFromEddb.getInfos(logName, body);
                mongoConnection.saveOrUpdate(logName, data, 'wingData', function(error) {
                    logger.info(logName + ' Job ended...');
                });    
            }
                    
        });
    });
};

module.exports = exports;