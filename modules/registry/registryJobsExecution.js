const logger = require('heroku-logger');

const extractEddbInfosJob = require('../job/extractEddbInfosJob.js');
const newsletterJob = require('../job/newsletterJob.js');

const logName = '[RegistryJobsExecution] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry job execution');
    
    extractEddbInfosJob.execute();
    newsletterJob.execute(client);    
};

module.exports = exports;