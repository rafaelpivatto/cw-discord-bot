const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const dateFormat = require('dateformat');

const utils = require('../../modules/utils.js');
const lastSeenPlayers = require('../../modules/service/lastSeenPlayers.js');
const errorMessage = require('../../modules/message/errorMessage.js');

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
            description: 'Players playing Elite: Dangerous',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        
        logger.info(logName + ' Execute by user = ' + msg.message.author.username);

        var games = [],
            users = msg.client.users,
            keyArray = users.keyArray(),
            playersRegistered = 0,
            playersOnline = 0,
            playingED = 0;
        for (var i = 0; i < keyArray.length; i++) {
            var user = users.get(keyArray[i]);
            if (user.bot) {
                continue;
            }
            playersRegistered++;
            if (user.presence && user.presence.status && user.presence.status !== 'offline') {
                playersOnline++;
            }
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
                .setTitle('**Estatísticas Cobra Wing informa...**')
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setDescription(
                    'Há no momento:\n' + 
                    '**' + playersOnline + '/' + playersRegistered + ' pessoas** online no discord\n' + 
                    '**' + getPlayersLabel(playingED) + '** jogando Elite: Dangerous' +
                    doubleWrapLine + 
                    'O recorde foi de **' + getPlayersLabel(data.qtd) + '** jogando **Elite: Dangerous** em ' + 
                    dateFormat(utils.getBRTDate(data.date), 'dd/mm/yyyy')
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