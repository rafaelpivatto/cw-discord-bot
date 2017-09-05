const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');

const logName = '[DelCustomCommand]';
const doubleWrapLine = '\n\n';
const wingColor = '#f00000';

module.exports = class GetCustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'delcustom',
            group: 'customcommands',
            memberName: 'delcustomcommand',
            description: 'Command to delete a custom commands',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        
        let commandData;
        if (msg.message.channel.name !== process.env.CUSTOM_COMMANDS_CHANNEL) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Esse comando não pode ser executado nessa sala.');
        }
        
        logger.info(logName + ' Execute delete command by user = ' + msg.message.author.username);
             
        if (!args || args.length === 0) {
            logger.warn(logName + ' Command without args');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Execute passando o nome do comando a ser deletado, exemplo: !delcustom <nome_comando>');
        }

        const query = {_id: args};
        mongoConnection.delete(logName, query, 'customCommands', function(error, result){
            if (error) {
                logger.error(logName + ' Error to delete data ', {'data': query, 'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Erro ao deletar o custom command, tente novamente.');
            } else {
                logger.info(logName + ' Custom command deleted = ', {'customCommand': query});
                let aliases = msg.client.registry.commands.get('@general').aliases;
                aliases.splice(aliases.indexOf(query._id), 1);
                if (result.result.n > 0) {
                    return msg.channel.send('Comando **"'+ query._id +'"** __deletado__ com sucesso.');
                } else {
                    return msg.channel.send('Nenhum comando foi deletado, verifique o nome e tente novamente.');
                }
            }
        });
        
    }
}    