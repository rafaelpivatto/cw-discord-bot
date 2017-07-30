const { Command } = require('discord.js-commando');
const utils = require("../../modules/utils");

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwping',
            group: 'ping',
            memberName: 'ping',
            description: 'Ping CW bot'
        });
    }

    async run(msg, args) {
        msg.channel.send("Pong :ping_pong: ");
    }
}    