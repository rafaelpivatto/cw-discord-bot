const schedule = require('node-schedule');
const logger = require('heroku-logger')

const eddbInfos = require('./eddbInfos');
const normalizeWingInfo = require('./normalizeWingInfo');
const mongoConnection = require('./mongoConnection');

var exports = {};

exports.execute = function() {
    //Execute every hour
    const j = schedule.scheduleJob('0 * * * *', function(){
        logger.info('[hourlyJob] Hourly job started...');
        eddbInfos.get(function(error, body) {
            if (!error) {
                const data = normalizeWingInfo.getInfos(body);
                mongoConnection.saveOrUpdate(data, 'wingData', function(error) {
                    logger.info('[hourlyJob] Hourly job ended...');
                });    
            }
                    
        });
    });
};

module.exports = exports;