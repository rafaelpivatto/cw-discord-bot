const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

const logName = '[GetCustomCommand]';
const doubleWrapLine = '\n\n';
const wingColor = '#f00000';

module.exports = class GetCustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'getcustom',
            group: 'customcommands',
            memberName: 'getcustomcommand',
            description: 'Command to get a custom command',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);
        let commandData = utils.removeDiacritics(String(args)).toLowerCase();
        
        if (msg.message.channel.name !== process.env.CUSTOM_COMMANDS_CHANNEL) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Esse comando não pode ser executado nessa sala.');
        }
          
        if (!commandData || commandData.length === 0) {
            logger.warn(logName + ' Command without args');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Execute passando o nome do comando a ser pesquisado, exemplo: !getcustom <nome_comando>');
        }
        
        const query = {_id: commandData};
        mongoConnection.find(logName, query, 'customCommands', function(error, data) {
            
            if (error) {
                logger.error(logName + ' Error on find command = ' + commandData, {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }
            if (!data || data.length == 0) {
                logger.info(logName + ' Commands not found = ' + commandData, {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Comando não encontrado... :thinking:');
            }
            
            delete data[0].createDate;
            delete data[0].createBy;

            const desc = JSON.stringify(data[0], null, '\t');
            
            msg.channel.send({'embed': new RichEmbed()
                .setColor('#f00000')
                .setTimestamp()
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setDescription('Conteúdo do comando: ' + data[0]._id + '\n\n')});
            return msg.channel.send(desc, {code: 'json'}).then(() => {
                
                msg.delete();
            
            }).catch(console.log);
        });
    }
}    