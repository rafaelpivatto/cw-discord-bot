const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('../gateway/searchWingInfosFromEddb');
const normalizeWingInfoFromEddb = require('../service/normalizeWingInfoFromEddb');
const feedRead = require('../gateway/feedReader.js');

const logName = '[NewsletterJob]';

exports.execute = function(bot) {
    //Execute every half hour
    schedule.scheduleJob('*/30 * * * *', function(){
        logger.info(logName + ' started...');
        
        feedRead.readFeed(logName, bot);
    });
};

module.exports = exports;