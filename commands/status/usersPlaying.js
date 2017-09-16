const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const dateFormat = require('dateformat');

const utils = require('../../modules/utils.js');
const lastSeenPlayers = require('../../modules/service/lastSeenPlayers.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const discordStatus = require('../../modules/service/discordStatus.js');

const logName = '[UsersPlaying]';
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
        const infos = discordStatus.getDiscordStatus(logName, msg.client);
        infos.games.sort(sortFunction);

        lastSeenPlayers.getAndUpdate(logName, infos.playingED, function(error, data){
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }

            let topPlaying = doubleWrapLine + ':video_game: **O que a galera está jogando:**\n\n';
            let countLines = 0;
            for(let game in infos.games) {
                countLines++;
                const g = infos.games[game];
                const decoration = g.name === 'Elite: Dangerous' ? '**' : '';
                topPlaying += decoration + '(' + g.count + ') ' + g.name + decoration + '\n';

                if (countLines >= 5) {
                    topPlaying += 'e + outros jogos...'
                    break;
                }
            }


            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('**Estatísticas CW**')
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setDescription(
                    'Há no momento:\n' + 
                    '**' + infos.playersOnline + '/' + infos.playersRegistered + ' pessoas** online no discord\n' + 
                    '**' + getPlayersLabel(infos.playingED) + '** jogando Elite: Dangerous' +
                    doubleWrapLine + 
                    ':trophy: O recorde foi de **' + getPlayersLabel(data.qtd) + '** jogando **Elite: Dangerous** em ' + 
                    dateFormat(utils.getBRTDate(data.date), 'dd/mm/yyyy') +
                    '\n\* *Dados contabilizados a partir de 23/08/2017*' + 
                    topPlaying
                );
            return msg.embed(embed);
        });

        //--- Methods ---      

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

        function sortFunction(a, b) {
            if (a.count === b.count) {
                return 0;
            } else {
                return (a.count > b.count) ? -1 : 1;
            }
        }
    }

    
}    