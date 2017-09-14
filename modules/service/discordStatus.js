const logger = require('heroku-logger')

const logName = '[DiscordStatus]';

exports.getDiscordStatus = function(logPrefix, client) {
    logger.info(logPrefix + logName + ' Starting get discord status');
    
    const infos = {
        games: [],
        playersRegistered: 0,
        playersOnline: 0,
        playingED: 0
    };
    const users = client.users,
    keyArray = users.keyArray();

    for (var i = 0; i < keyArray.length; i++) {
        const user = users.get(keyArray[i]);
        if (user.bot) {
            continue;
        }
        infos.playersRegistered++;
        if (user.presence && user.presence.status && user.presence.status !== 'offline') {
            infos.playersOnline++;
        }
        if (!user.presence || !user.presence.game || user.bot) {
                continue;
        }
        const gameName = user.presence.game.name;
        if (gameName === 'Elite: Dangerous') infos.playingED++;
        
        let item = infos.games.find(x => x.name === gameName);
        if (!item) {
            infos.games.push({
                name: gameName,
                count: 1
            });
        } else {
            item.count++; 
        }
    }


    return infos;
};

module.exports = exports;