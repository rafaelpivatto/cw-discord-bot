const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');

const logName = '[Ping]';
const wingColor = '#f00000';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwping',
            group: 'status',
            memberName: 'ping',
            description: 'Ping CW bot',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Execute ping by user = ' + msg.message.author.username);
        const message = 'Pong :ping_pong: \n' +
                        'Seu ping é de: ' + msg.client.pings[0] + 'ms.\n\n' +
                        '\* *Atualizado a cada minuto.*'; 
        msg.channel.send();

        let embed = new RichEmbed()
            .setColor(wingColor)
            .setTimestamp()
            .setTitle('Discord ping')
            .setThumbnail('https://i.imgur.com/Ds9Iy7G.png')
            .setFooter('Fly safe cmdr!')
            .setDescription(message);

        return msg.embed(embed);
    }
}    