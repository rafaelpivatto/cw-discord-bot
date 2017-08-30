const { Command } = require('discord.js-commando');
const logger = require('heroku-logger')

const utils = require('../../modules/utils.js');

const logName = '[Ping]';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwping',
            group: 'status',
            memberName: 'ping',
            description: 'Ping CW bot'
        });
    }

    async run(msg, args) {
        if (utils.blockDirectMessages(msg)) return;
        logger.info(logName + ' Execute ping by user = ' + msg.message.author.username);
        msg.channel.send('Pong :ping_pong: ');
    }
}    