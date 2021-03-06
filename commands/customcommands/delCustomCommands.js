const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

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
        if (process.env.ENABLED_CUSTOM_COMMANDS !== 'true') return;
        
        utils.logMessageUserExecuteCommand(logName, msg);

        let commandData = utils.removeDiacritics(String(args)).toLowerCase();
        if (msg.message.channel.name !== process.env.CUSTOM_COMMANDS_CHANNEL) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Esse comando não pode ser executado nessa sala.');
        }
             
        if (!commandData || commandData.length === 0) {
            logger.warn(logName + ' Command without args');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Execute passando o nome do comando a ser deletado, exemplo: !delcustom <nome_comando>');
        }

        const query = {_id: commandData};
        mongoConnection.delete(logName, query, 'customCommandsV2', function(error, result){
            if (error) {
                logger.error(logName + ' Error to delete data ', {'data': query, 'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Erro ao deletar o custom command, tente novamente.');
            } else {
                logger.info(logName + ' Custom command deleted = ', {'customCommand': query});
                
                //remove command from index
                let aliases = msg.client.registry.commands.get('@general').aliases;
                aliases.splice(aliases.indexOf(query._id), 1);
                
                //registry type
                mongoConnection.findGroup(logName, ['type'], {}, {}, 'customCommandsV2', function(error, data) {
                    if (error || !data) {
                        logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
                    }
                    if (data.length && data.length > 0) {
                        const aliases = [];
                        for(let item of data) {
                            aliases.push(item.type);
                        }
                        msg.client.registry.commands.get('@listcustom').aliases = aliases;
                        logger.info(logName + ' Success to register group custom commands');
                    }
                });

                //send message
                let message;
                if (result.result.n > 0) {
                    message = 'Comando **"'+ query._id +'"** __deletado__ com sucesso.';
                } else {
                    message = 'Nenhum comando foi deletado, verifique o nome e tente novamente.';
                }

                return msg.channel.send({'embed': new RichEmbed()
                    .setColor('#f00000')
                    .setTimestamp()
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setDescription(message)}).then(() => {
                        
                    msg.delete();
                
                }).catch(console.log);
            }
        });
        
    }
}    