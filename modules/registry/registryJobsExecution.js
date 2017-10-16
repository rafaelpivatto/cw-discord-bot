const logger = require('heroku-logger');

const extractEddbInfosJob = require('../job/extractEddbInfosJob.js');
const newsletterJob = require('../job/newsletterJob.js');
const checkServerStatusJob = require('../job/checkServerStatusJob.js');
const usersPlayingEliteDangerousJob = require('../job/usersPlayingEliteDangerousJob.js');
const gameUpdateJob = require('../job/gameUpdateJob.js');
const galnetJob = require('../job/galnetJob.js');
const keepAlive = require('../job/keepAlive.js');

const logName = '[RegistryJobsExecution] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry job execution');
    
    extractEddbInfosJob.execute();
    newsletterJob.execute(client);
    checkServerStatusJob.execute(client);
    usersPlayingEliteDangerousJob.execute(client);
    //gameUpdateJob.execute(client);
    galnetJob.execute(client);
    keepAlive.execute();
};

module.exports = exports;