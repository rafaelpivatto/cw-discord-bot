const schedule = require('node-schedule');
const logger = require('heroku-logger')

const getFromUrl = require('../gateway/getFromUrl.js');

const logName = '[KeepAlive]';

exports.execute = function() {
    
    if (process.env.BASE_URL) {
        //Execute every 15 minutos
        schedule.scheduleJob('*/15 * * * *', function(){
            logger.info(logName + ' started...');
            
            getFromUrl.getHtml(logName, process.env.BASE_URL, function(){});
        });
    }
};

module.exports = exports;