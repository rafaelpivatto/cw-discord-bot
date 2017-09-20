const logger = require('heroku-logger');

const extractEddbInfosJob = require('../job/extractEddbInfosJob.js');
const newsletterJob = require('../job/newsletterJob.js');
const checkServerStatusJob = require('../job/checkServerStatusJob.js');
const usersPlayingEliteDangerousJob = require('../job/usersPlayingEliteDangerousJob.js');
const gameUpdateJob = require('../job/gameUpdateJob.js');

const logName = '[RegistryJobsExecution] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry job execution');
    
    extractEddbInfosJob.execute();
    newsletterJob.execute(client);
    checkServerStatusJob.execute(client);
    usersPlayingEliteDangerousJob.execute(client);
    gameUpdateJob.execute(client);
};

module.exports = exports;