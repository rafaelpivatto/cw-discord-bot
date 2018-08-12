const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const mongoConnection = require('../../modules/connection/mongoConnection.js');

const wrapLine = '\n';
const logName = '[CWAjuda]';

let wingThumb, wingColor;

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwajuda',
            group: 'help',
            memberName: 'help',
            aliases: ['cwhelp', 'ajuda', 'help'],
            description: 'Help for CW bot',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        if (!utils.isGuildConfigEnabled(msg.guild, 'help.enabled')) {
            return;
        }
        utils.logMessageUserExecuteCommand(logName, msg);
        
        let message = utils.getGuildConfig(msg.guild, 'help.description');
        
        mongoConnection.findGroup(logName, ['type'], {'showInMenu': true}, {}, 'customCommandsV2', function(error, data) {
            if (!error && data && data.length > 0) {
                message += '\n\n';
                for(let item of data) {
                    message += '**!' + item.type + '** - *Lista todos os comandos de ' + item.type + '*\n';
                }
            }

            message += utils.getGuildConfig(msg.guild, 'help.footer');
            
            let embed = new RichEmbed()
                .setColor(utils.getGuildConfig(msg.guild, 'help.color'))
                .setTimestamp()
                .setTitle('Comandos do CobraWingBot')
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setThumbnail(utils.getGuildConfig(msg.guild, 'help.thumb'))
                .setFooter('Fly safe cmdr!')
                .setDescription(message);

            return msg.embed(embed);
        });
    }
}    