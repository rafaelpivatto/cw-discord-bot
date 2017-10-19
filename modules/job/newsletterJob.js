const schedule = require('node-schedule');
const logger = require('heroku-logger')

const feedRead = require('../gateway/feedReader.js');

const logName = '[NewsletterJob]';

exports.execute = function(client) {
    //Execute every hour **:03
    schedule.scheduleJob('3 * * * *', function(){
        logger.info(logName + ' started...');
        
        feedRead.readFeed(logName, client);
    });
};

module.exports = exports;