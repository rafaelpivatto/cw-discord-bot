const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('./searchWingInfosFromEddb');
const normalizeWingInfoFromEddb = require('./normalizeWingInfoFromEddb');
const feedRead = require('./feedRead.js');

const logName = '[HalfHourlyJob-Newsletter]';

var exports = {};

exports.execute = function(bot) {
    const j = schedule.scheduleJob('*/30 * * * *', function(){
        logger.info(logName + ' Job started...');
        
        feedRead.readFeed(logName, bot);
    });
};

module.exports = exports;