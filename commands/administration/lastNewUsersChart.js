const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const generateUsersGraph = require('../../modules/service/generateUsersGraph.js');
const errorMessage = require('../../modules/message/errorMessage.js');

const wrapLine = '\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingColor = '#f00000';
const logName = '[LastNewUsersChart]';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'novosmembros',
            group: 'administration',
            memberName: 'novosmembros',
            description: 'Command to generate chart for news users',
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        if (process.env.ENABLED_ADMINISTRATION !== 'true') return;
        
        utils.logMessageUserExecuteCommand(logName, msg);

        msg.delete();

        if (!process.env.RULE_MODERATOR) return;
        if (!msg.member.roles.find(val => val.name === process.env.RULE_MODERATOR)) return;
        
        msg.channel.send({'embed': new RichEmbed()
            .setColor(wingColor)
            .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
            .setTimestamp()
            .setFooter('Fly safe cmdr!')
            .setDescription(':arrows_counterclockwise: Aguarde um instante, o gráfico está sendo gerado...')}).then(waitMessage => {

            generateUsersGraph.generate(logName, (err, imageAddress) => {
                if (err) {
                    return errorMessage.sendSpecificClientErrorMessage(msg, err);
                }

                let embed = new RichEmbed()
                    .setTitle('**Gráfico de usuários no Discord**')
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setImage(imageAddress)
                    .setColor(wingColor)
                    .setTimestamp()
                    .setFooter('Fly safe cmdr!');
                
                onlyInDev(msg, imageAddress);
                
                waitMessage.delete();

                return msg.embed(embed);
            });
        });

        const onlyInDev = (msg, imageAddress) => {
            if (process.env.ENVIRONMENT === 'DEV') {
                msg.channel.send('', {
                    file: imageAddress
                });
            }
        }
    }
}    