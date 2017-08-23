const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const utils = require('../../modules/utils.js');
const lastSeenPlayers = require('../../modules/lastSeenPlayers.js');
const dateFormat = require('dateformat');

const logName = '[usersPlaying]';
const doubleWrapLine = '\n\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingUrlSite = 'http://elitedangerouscobra.com.br';
const wingColor = '#f00000';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwjogando',
            group: 'status',
            memberName: 'playing',
            description: 'Players playing Elite: Dangerous'
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Execute by user = ' + msg.message.author.username);

        var games = [];
        var users = msg.client.users;
        var keyArray = users.keyArray();
        var playersOnline = 0;
        var playingED = 0;
        for (var i = 0; i < keyArray.length; i++) {
            var user = users.get(keyArray[i]);
            if (user.bot) {
                continue;
            }
            playersOnline++;
            if (!user.presence || !user.presence.game || user.bot) {
                    continue;
            }
            var gameName = user.presence.game.name;
            if (gameName === 'Elite: Dangerous') playingED++;
            if(!games[gameName]) {
                games[gameName] = 1;  
            } else {
                games[gameName] = games[gameName] + 1;
            }
        }

        lastSeenPlayers.getAndUpdate(logName, playingED, function(error, data){
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }

            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('**Estatísticas Cobra Wing**')
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setDescription(
                    'No momento há:\n' + 
                    '**' + playersOnline + ' pessoas** online no discord\n' + 
                    '**' + getPlayersLabel(playingED) + '** jogando Elite: Dangerous' +
                    doubleWrapLine + 
                    'Nosso recorde foi de **' + getPlayersLabel(data.qtd) + '** jogando **Elite: Dangerous** em ' + 
                    dateFormat(data.date, 'dd/mm/yyyy')
                );

            return msg.embed(embed);

        });

        function getPlayersLabel(qtd) {
            switch (qtd) {
                case 0:
                    return 'Ninguém';
                    break;
                case 1:
                    return qtd + ' pessoa';
                    break;
                default:
                    return qtd + ' pessoas';
            }
        }
    }

    
}    