const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('../gateway/searchWingInfosFromEddb');
const normalizeWingInfoFromEddb = require('../service/normalizeWingInfoFromEddb');
const feedRead = require('../gateway/feedReader.js');

const logName = '[HalfHourlyJob-Newsletter]';

exports.execute = function(bot) {
    const j = schedule.scheduleJob('*/30 * * * *', function(){
        logger.info(logName + ' Job started...');
        
        feedRead.readFeed(logName, bot);
    });
};

module.exports = exports;