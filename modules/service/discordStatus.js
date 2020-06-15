const logger = require('heroku-logger');

const logName = '[DiscordStatus]';

exports.getDiscordStatus = function (logPrefix, guild) {
  logger.info(logPrefix + logName + ' Starting get discord status');

  const members = guild.members.filter((member) => member.user.bot === false);
  const memberGamePresences = members
    .filter(
      (member) =>
        member.presence.status !== 'offline' &&
        member.presence.activities.length > 0
    )
    .map((member) => member.presence.activities)
    .map((activities) => {
      for (const activity of activities) {
        if (activity.type === 0) {
          return activity;
        }
      }
    })
    .filter((activity) => activity !== undefined);

  const infos = {
    games: [],
    playersRegistered: members.size,
    playersOnline: members.filter((m) => m.presence.status !== 'offline').size,
    playingED:
      memberGamePresences.filter(
        (game) =>
          game.name.indexOf('Elite') !== -1 &&
          game.name.indexOf('Dangerous') !== -1
      ).length || 0,
  };

  memberGamePresences.forEach((game) => {
    const gameName = game.name.replace(/:/g, '');
    const gameFound = infos.games.find((i) => i.name === gameName);

    if (gameFound) {
      gameFound.count++;
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
