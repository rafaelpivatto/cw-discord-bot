const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const jsonminify = require('jsonminify');

const mongoConnection = require('../../modules/connection/mongoConnection.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

const logName = '[AddCustomCommand]';

module.exports = class AddCustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addcustom',
            group: 'customcommands',
            memberName: 'addcustomcommand',
            description: 'Command to add a custom commands',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        let commandData;
        if (msg.message.channel.name !== process.env.CUSTOM_COMMANDS_CHANNEL) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Esse comando não pode ser executado nessa sala.');
        }
        
        if (!args || args.length === 0) {
            logger.warn(logName + ' Command without args');
            errorMessage.sendSpecificClientErrorMessage(msg, 'Execute o comando passando o json, exemplo: \n\n' +
                '¹ O campo _id deve ser totalmente em letras minusculas e sem espaços.\n' +
                '² Os campos title, description, alert, image e thumbnail são opcionais.\n');
            return msg.message.channel.send(getExample());
        }

        try {
            const minified = JSON.minify(args);
            commandData = JSON.parse(minified);
        } catch (e) {
            console.log(e);
            logger.warn(logName + ' Error on converting json');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Tem algo errados com o json, verifique a formatação, vírgulas, valores e etc...\nUma dica: valide o json em: <https://jsonlint.com>');
        }
        
        const errors = validateJson(commandData);
        if (errors.length > 0){
            logger.warn(logName + ' Errors on json data');
            return errorMessage.sendSpecificClientErrorMessage(msg, errors)
        }
        commandData.createDate = new Date();
        commandData.createBy = utils.getUserNickName(msg) + '#' + msg.message.author.discriminator;
        commandData._id = String(commandData._id).toLowerCase().replace(/ /g, '');

        mongoConnection.saveOrUpdate(logName, commandData, 'customCommands', function(error, result){
            if (error) {
                logger.error(logName + ' Error to save data ', {'data': commandData, 'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 'Erro ao salvar custom command, tente novamente.');
            } else {
                logger.info(logName + ' Custom command saved = ', {'customCommand': commandData});
                msg.client.registry.commands.get('@general').aliases.push(commandData._id);
                const label = result.result.nModified === 0 ? 'criado' : 'alterado';
                return msg.channel.send({'embed': new RichEmbed()
                    .setColor('#f00000')
                    .setTimestamp()
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setDescription('Comando **"'+ commandData._id +'"** __' + label + '__ com sucesso.')});
            }
        });

        //--- Methods ---

        function getExample() {
            return '```JSON\n{\n' +
                '\t"_id": "nomedocomando",\n' +
                '\t"title": "titulo do comando",\n' +
                '\t"content": "conteúdo do comando",\n' +
                '\t"description": "descrição do comando",\n' +
                '\t"alert": "alerta para tags ex: @Pesquisador",\n' +
                '\t"image": "url de uma imagem",\n' +
                '\t"thumbnail": "url de uma thumbnail",\n' +
                '\t"type": "science"' +
            '\n}\n```\n';
        }

        function validateJson(data) {
            let errors = [];
            if (!data._id) {
                errors.push('o campo "_id" é obrigatório.');
            }
            if (!data.content) {
                errors.push('o campo "content" é obrigatório.');
            }
            if (!data.type) {
                errors.push('o campo "type" é obrigatório.');
            }
            return errors;
        }
    }
}    