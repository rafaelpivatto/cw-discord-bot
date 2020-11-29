const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

const logName = '[GetCustomCommand]';
const wrapLine = '\n';
const wingColor = '#f00000';

module.exports = class GetCustomCommand extends Command {
    constructor(client) {
        const directMessage = (process.env.BLOCK_BOT_DIRECT_MESSAGES === 'true');
        super(client, {
            name: '@listcustom',
            group: 'customcommands',
            memberName: 'listcustomcommand',
            description: 'Command to list a custom commands',
            guildOnly: directMessage,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        if (process.env.ENABLED_CUSTOM_COMMANDS !== 'true') return;
        
        utils.logMessageUserExecuteCommand(logName, msg);

        const commandName = String(msg.message.content).replace(args, '').replace('!', '').toLowerCase();
        const query = {type: commandName};
        mongoConnection.find(logName, query, 'customCommandsV2', function(error, data) {
            
            if (error) {
                logger.error(logName + ' Error on find command = ' + commandName, {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }
            if (!data || data.length == 0) {
                logger.info(logName + ' Commands not found = ' + commandName, {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Não existem comandos de ' + commandName + ' :confused:');
            }

            data.sort(sortFunction);
            let description = '';

            for (let item of data) {
                description += `**!${item._id}** ${getDescription(item)}${wrapLine}`;
            }
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setFooter('Fly safe cmdr!')
                .setTitle('Comandos de ' + commandName)
                .setDescription(description);

            return msg.embed(embed);
        });

        //--- Methods ---

        function getValue(param) {
            return param ? param : '';
        }

        function sortFunction(a, b) {
            if (a._id === b._id) {
                return 0;
            } else {
                return (a._id < b._id) ? -1 : 1;
            }
        }

        function getDescription(item) {
            if (item.description && String(item.description).trim() !== '') {
                return  `- *${String(item.description).trim()}*`;
            } else {
                return '';
            }
        }
        
    }
}    