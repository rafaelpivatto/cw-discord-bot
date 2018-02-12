const schedule = require('node-schedule');
const logger = require('heroku-logger')

const feedRead = require('../gateway/feedReader.js');
const utils = require('../utils.js');

const logName = '[NewsletterJob]';

exports.execute = (client) => {

    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every hour **:03
        schedule.scheduleJob('3 * * * *', () => {
            logger.info(logName + ' started...');
            
            feedRead.readFeed(logName, client);
        });
    }
};

module.exports = exports;