const schedule = require('node-schedule');
const logger = require('heroku-logger')

const feedRead = require('../gateway/feedReader.js');

const logName = '[NewsletterJob]';

exports.execute = function(client) {
    //Execute every 3 hours on Thursday, Friday and Saturday
    schedule.scheduleJob('* 0-3-6-9-12-15-18-21 * * 4-6', function(){
        logger.info(logName + ' started...');
        
        feedRead.readFeed(logName, client);
    });
};

module.exports = exports;