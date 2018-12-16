const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
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
let gameName;

module.exports = class UsersPlayingCommand extends Command {
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
        utils.logMessageUserExecuteCommand(logName, msg);
        
        const infos = discordStatus.getDiscordStatus(logName, msg.client);
        infos.games.sort(sortFunction);

        lastSeenPlayers.getAndUpdate(logName, infos.playingED, function(error, data){
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }

            let topPlaying = doubleWrapLine + ':video_game: **O que a galera está jogando:**\n\n',
                countLines = 0,
                otherPlaying = 0,
                totalPlaying = 0;
            for(let game in infos.games) {
                countLines++;
                if (countLines < 16) {
                    const g = infos.games[game];
                    let decoration = '';
                    if (g.name.indexOf('Elite') != -1 && g.name.indexOf('Dangerous')) {
                        decoration = '**';
                        gameName = g.name;
                    }
                    topPlaying += decoration + '(' + g.count + ') ' + g.name + decoration + '\n';
                    totalPlaying += g.count;
                } else {
                    totalPlaying += infos.games[game].count;
                    otherPlaying++;
                }
            }
            if (countLines === 0) {
                topPlaying += ':frowning: Poxa, não estão jogando nada...';
            }
            if (otherPlaying > 0) {
                topPlaying += '(' + otherPlaying + ') Jogando outros variados jogos...';
            }
            
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setTimestamp()
                .setTitle('**Estatísticas CW**')
                .setThumbnail(wingThumb)
                .setFooter('Dados contabilizados a partir de 23/08/2017')
                .setDescription(
                    'Há no momento:\n' + 
                    '**' + infos.playersOnline + '/' + infos.playersRegistered + ' pessoas** online no discord\n' + 
                    '**' + getPlayersLabel(totalPlaying) + '** se divertindo com algum game\n' +
                    '**' + getPlayersLabel(infos.playingED) + '** jogando ' + gameName +
                    doubleWrapLine + 
                    ':trophy: O recorde foi de **' + getPlayersLabel(data.qtd) + '** jogando **Elite: Dangerous** em ' + 
                    dateFormat(utils.getBRTDate(data.date), 'dd/mm/yyyy') + 
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