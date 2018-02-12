const schedule = require('node-schedule');
const logger = require('heroku-logger')

const getFromUrl = require('../gateway/getFromUrl.js');
const utils = require('../utils.js');

const logName = '[KeepAlive]';

exports.execute = function() {
    
    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every 15 minutes 
        schedule.scheduleJob('*/15 * * * *', function(){
            
            logger.info(logName + ' started...');
            
            if (process.env.KEEP_ALIVE_URL) {
                
                const urls = process.env.KEEP_ALIVE_URL.split('|');

                for(url in urls) {
                    getFromUrl.getHtml(logName, url, () => {});
                }
            }
        });
    }
};

module.exports = exports;