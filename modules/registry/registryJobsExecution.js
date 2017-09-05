const logger = require('heroku-logger');

const hourlyJob = require('../job/hourlyJob.js');
const halfHourlyJob = require('../job/halfHourlyJob.js');

const logName = '[RegistryJobsExecution] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry job execution');
    
    hourlyJob.execute();
    halfHourlyJob.execute(client);    
};

module.exports = exports;