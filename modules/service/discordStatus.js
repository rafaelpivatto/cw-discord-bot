const logger = require('heroku-logger');

const logName = '[DiscordStatus]';

exports.getDiscordStatus = function (logPrefix, guild) {
  logger.info(logPrefix + logName + ' Starting get discord status');

  if (guild.available) {
    return null;
  }

  const members = guild.members.filter((member) => member.user.bot === false);
  const membersOnline = members.filter((m) => m.presence.status !== 'offline');

  const infos = {
    games: [],
    playersRegistered: members.size,
    playersOnline: membersOnline.size,
    playingED:
      memberGamePresences.filter(
        (game) =>
          game.name.indexOf('Elite') !== -1 &&
          game.name.indexOf('Dangerous') !== -1
      ).length || 0,
  };

  const memberGamePresences = membersOnline
    .filter((member) => member.presence.activities.length > 0)
    .map((member) => {
      for (const activity of member.presence.activities) {
        if (activity && activity.type === 0) {
          return activity;
        }
      }
    })
    .filter((activity) => activity !== undefined)
    .forEach((activity) => {
      const gameName = activity.name.replace(/:/g, '');
      var existGame = infos.games.find(game => game.name === gameName);
      if (existGame) {
          existGame.count++;
      } else {
        infos.games.push({
            name: gameName,
            count: 1,
        });
      }
    });

  return infos;
};

module.exports = exports;
