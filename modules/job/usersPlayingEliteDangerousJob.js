const schedule = require('node-schedule');
const logger = require('heroku-logger');

const discordStatus = require('../service/discordStatus.js');
const lastSeenPlayers = require('../service/lastSeenPlayers.js');
const utils = require('../utils.js');

const logName = '[UsersPlayingEliteDangerousJob]';

exports.execute = (client) => {
    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every 15 minutos
        schedule.scheduleJob('*/15 * * * *', () => {
            logger.info(logName + ' started...');
            
            const infos = discordStatus.getDiscordStatus(logName, client);
            lastSeenPlayers.getAndUpdate(logName, infos.playingED, () => {});
        });
    }
};

module.exports = exports;