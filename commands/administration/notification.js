const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const errorMessage = require('../../modules/message/errorMessage.js');
const utils = require('../../modules/utils.js');

const wrapLine = '\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingColor = '#f00000';
const logName = '[Notification]';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'notify',
            group: 'administration',
            memberName: 'notify',
            description: 'Help for CW boCommand to notifyt',
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        if (!msg.member.roles.find('name', process.env.RULE_ADMIN_BOT)) return;
        
        if (!args || args === '') {
            logger.warn(logName + ' Command without args');
            errorMessage.sendSpecificClientErrorMessage(msg, 'Execute o comando passando o json, exemplo: \n\n' +
                'Obs: Os campos "message" e "channelName" são obrigatórios.\n');
            return msg.message.channel.send(getExample());
        }

        let channel, minified, messageData;

        try {
            minified = JSON.minify(args);
            messageData = JSON.parse(minified);
        
            if (!messageData.message || !messageData.channelName) {
                logger.warn(logName + ' required field are not filled');
                errorMessage.sendSpecificClientErrorMessage(msg, 'Os campos "message" e "channelName" são obrigatórios.\n');
                return msg.message.channel.send(getExample());
            }
            channel = msg.client.channels.find('name', messageData.channelName);
            if (!channel) {
                logger.warn(logName + ' channel not found');
                errorMessage.sendSpecificClientErrorMessage(msg, 'Os campos "message" e "channelName" são obrigatórios.\n');
            }

        } catch (e) {
            logger.error(logName + ' Error on converting json');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Tem algo errados com o json, verifique a formatação, vírgulas, valores e etc...\nUma dica: valide o json em: <https://jsonlint.com>');
        }

        const embed = new RichEmbed()
            .setColor(wingColor)
            .setTimestamp()
            .setThumbnail(messageData.thumbnail || '')
            .setImage(messageData.image || '')
            .setTitle(messageData.title || '')
            .setFooter(messageData.footer || 'Fly safe, cmdr!')
            .setDescription(messageData.message);

        return channel.send(messageData.notify, {'embed': embed});

        //--- Methods ---

        function getExample() {
            return '```JSON\n{\n' +
                '\t"message": "mensagem a ser enviada",\n' +
                '\t"channelName": "nome do canal que a enviar a notificação",\n' +
                '\t"notify": "ex: @everyone",\n' +
                '\t"title": "titulo da mensagem",\n' +
                '\t"image": "url de uma imagem",\n' +
                '\t"thumbnail": "url de uma thumbnail",\n' +
                '\t"footer": "mensagem no rodapé"' +
            '\n}\n```\n';
        }
    }
}    