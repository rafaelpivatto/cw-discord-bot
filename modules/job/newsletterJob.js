const schedule = require('node-schedule');
const logger = require('heroku-logger')

const feedRead = require('../gateway/feedReader.js');

const logName = '[NewsletterJob]';

exports.execute = function(client) {
    //Execute every 3 hours on Thursday, Friday and Saturday
    schedule.scheduleJob('* */2 * * 4-6', function(){
        logger.info(logName + ' started...');
        
        feedRead.readFeed(logName, client);
    });
};

module.exports = exports;