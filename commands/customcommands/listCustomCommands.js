const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');

const logName = '[GetCustomCommand]';
const wrapLine = '\n';
const wingColor = '#f00000';

module.exports = class GetCustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: '@listcustom',
            group: 'customcommands',
            memberName: 'listcustomcommand',
            aliases: ['science', 'memes', 'ranks'],
            description: 'Command to list a custom commands',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        
        const commandName = String(msg.message.content).replace(args, '').replace('!', '').toLowerCase();
        logger.info(logName + ' Execute command = ' + commandName + ' by user = ' + msg.message.author.username);
        
        const query = {type: commandName};
        mongoConnection.find(logName, query, 'customCommands', function(error, data) {
            
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
                description += '**!' + item._id + '** - *' + String(item.description).trim() + '*' + wrapLine;
            }
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
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
        
    }
}    