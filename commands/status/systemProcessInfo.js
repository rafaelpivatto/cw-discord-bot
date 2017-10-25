const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const stats = require('pc-stats');

const errorMessage = require('../../modules/message/errorMessage.js');

const logName = '[SystemProcessInfo]';
const wingColor = '#f00000';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            group: 'status',
            memberName: 'botinfo',
            description: 'botinfo',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {

        if (msg.message.channel.name !== process.env.CUSTOM_COMMANDS_CHANNEL) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Esse comando não pode ser executado nessa sala.');
        }

        logger.info(logName + ' Execute by user = ' + msg.message.author.username);
        stats().then((statistics) => {
            return msg.channel.send(JSON.stringify(statistics, null, '\t'), {code: 'json'});
        }).catch((err) => {
            return msg.channel.send(' Error: ' + err);
            logger.error(logName + ' Error: ' + err);
        });
    }
}    