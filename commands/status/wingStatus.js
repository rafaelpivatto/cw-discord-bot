const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger')

const errorMessage = require('../../modules/errorMessage.js');
const normalizeWingInfoFromEddb = require('../../modules/normalizeWingInfoFromEddb');
const mongoConnection = require('../../modules/mongoConnection');
const utils = require('../../modules/utils');
const searchWingInfosFromEddb = require('../../modules/searchWingInfosFromEddb');

const logName = '[WingStatus]';

const wrapLine = '\n';
const wingUrl = 'https://eddb.io/faction/74863';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingUrlSite = 'http://elitedangerouscobra.com.br';
const wingColor = '#f00000';

module.exports = class EmbedCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwstatus',
            group: 'status',
            memberName: 'wingstatus',
            description: 'Verify CW status'
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Initializing process to retrieving status by user = ' + msg.message.author.username);
        let out = '';
        searchWingInfosFromEddb.get(logName, function(error, body) {
            if (error || !body) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O EDDB ficou sem combustível, logo os fuel rats vão ajudar ele, daí podemos tentar novamente, Fly safe CMDR!'
                );
            }
            const data = normalizeWingInfoFromEddb.getInfos(logName, body);
            saveToMongo(data);
            if (data.wingName == null) {
                logger.error(logName + ' Wing name not found');
                return errorMessage.sendClientErrorMessage(msg);
            }
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('**Sistemas e influências da ' + data.wingName + '**')
                .setDescription('Dados extraídos do [eddb.io](' + wingUrl + ')')
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setURL(wingUrlSite);
            
            for(let info of data.infos) {
                embed.addField('**' + getSystemName(info) + '**',
                    '**Influência: ** '+ utils.rpad(getInfluence(info), 10) + ' ' + 
                    '**Att. à ' + info.eddbUpdate + '**' + wrapLine +
                    '**Segurança: ** ' + info.security + wrapLine + 
                    '**Estado: ** ' + info.state);
            }
            logger.info(logName + ' Finish process to retrieving status');
            return msg.embed(embed);
        });

        function getSystemName(info) {
            let name = info.systemName; 
            if (info.controlledSystem) {
                name += ' :crown:';
            }
            if (info.state === 'War') {
                name += ' :crossed_swords:';
            }
            if (info.state === 'Election') {
                name += ' :loudspeaker:';
            }
            if (info.influence < 5.0) {
                name += ' :rotating_light:';
            }
            return name;
        }

        function getInfluence(info) {
            return String(info.influence).replace('.', ',') + '%';
        }

        function saveToMongo(data) {
            mongoConnection.saveOrUpdate(logName, data, 'wingData', function(error) {
                if (error) console.log(error);
            });
        }
    }
}