const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const mongoConnection = require('../../modules/connection/mongoConnection.js');

const wrapLine = '\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingColor = '#f00000';
const logName = '[CWAjuda]';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwajuda',
            group: 'help',
            memberName: 'ajuda',
            aliases: ['cwhelp', 'help', 'ajuda', 'cwajuda'],
            description: 'Help for CW bot',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        if (process.env.ENABLED_HELP !== 'true') return;
        
        utils.logMessageUserExecuteCommand(logName, msg);
        
        let message = '__**Abaixo os principais comandos que possam ajudar:**__\n\n' +
            '**!cobrawing** - *Comandos de auxilio ao power play e outras coisas voltadas a Cobra Wing .*' + wrapLine +
            '**!elitedangerous** - *Comandos gerais para axiliar a jogabilidade no Elite Dangerous.*' + wrapLine +
            '**!utilidades** - *Conjunto de sites extremente úteis para auxiliar a jobabilidade geral.*';
        
        mongoConnection.findGroup(logName, ['type'], {'showInMenu': true}, {}, 'customCommandsV2', function(error, data) {
            if (!error && data && data.length > 0) {
                message += '\n\n';
                for(let item of data) {
                    message += '**!' + item.type + '** - *Lista todos os comandos de ' + item.type + '*\n';
                }
            }

            message += '\n**\*Caso não encontrar algo, procure ou pergunte na sala** <#189856121580683266>';

            let embed = new RichEmbed()
                    .setColor(wingColor)
                    .setTimestamp()
                    .setTitle('Comandos do CobraWingBot')
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setThumbnail(wingThumb)
                    .setFooter('Fly safe cmdr!')
                    .setDescription(message);

            return msg.embed(embed);
        });
    }
}    