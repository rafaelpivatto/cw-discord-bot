const schedule = require('node-schedule');
const logger = require('heroku-logger');

const discordStatus = require('../service/discordStatus.js');
const lastSeenPlayers = require('../service/lastSeenPlayers.js');

const logName = '[UsersPlayingEliteDangerousJob]';

exports.execute = function(client) {
    //Execute every 15 minutos
    schedule.scheduleJob('*/15 * * * *', function(){
        logger.info(logName + ' started...');
        
        const infos = discordStatus.getDiscordStatus(logName, client);
        lastSeenPlayers.getAndUpdate(logName, infos.playingED, function(){});
    });
};

module.exports = exports;