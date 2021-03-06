const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

const logName = '[RunCustomCommand]';
const doubleWrapLine = '\n\n';
const wingColor = '#f00000';

module.exports = class GetCustomCommand extends Command {
    constructor(client) {
        const directMessage = (process.env.BLOCK_BOT_DIRECT_MESSAGES === 'true');
        super(client, {
            name: '@general',
            group: 'customcommands',
            memberName: 'runcustomcommand',
            description: 'Command to run a custom commands',
            guildOnly: directMessage,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        if (process.env.ENABLED_CUSTOM_COMMANDS !== 'true') return;
        
        utils.logMessageUserExecuteCommand(logName, msg);
        
        const commandName = String(msg.message.content).replace(args, '').replace('!', '').toLowerCase();
        const query = {_id: commandName};
        mongoConnection.find(logName, query, 'customCommandsV2', function(error, data) {
            
            if (error) {
                logger.error(logName + ' Error on find command = ' + commandName, {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }
            if (!data || data.length == 0) {
                logger.info(logName + ' Commands not found = ' + commandName, {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Comando não encontrado... :thinking:');
            }
            const item = data[0];
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setFooter('Fly safe cmdr!')
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setTitle(getValue(item.title))
                .setImage(getValue(item.image))
                .setThumbnail(getValue(item.thumbnail))
                .setDescription(getValue(item.content));
            
            return msg.channel.send(item.alert, {'embed': embed});
        });

        function getValue(param) {
            return param ? param : '';
        }
        
    }
}    