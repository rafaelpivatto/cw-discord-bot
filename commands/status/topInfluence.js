const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const getInaraWingFactionActivity = require('../../modules/service/getInaraWingFactionActivity.js');

const logName = '[TopInfluence]';
const wingColor = '#f00000';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'topguardians',
            group: 'status',
            memberName: 'topguardians',
            description: 'topguardians check',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        msg.channel.send({'embed': new RichEmbed()
            .setColor(wingColor)
            .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
            .setTimestamp()
            .setDescription(':arrows_counterclockwise: Aguarde um instante...')}).then(waitMessage => {
            
            getInaraWingFactionActivity.getFactionActivity(logName, (data) => {
                let embed = new RichEmbed()
                    .setColor(wingColor)
                    .setTimestamp()
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setFooter('Fly safe cmdr!')
                    .setThumbnail(wingThumb)
                    .setTitle('Top 10 de influência dos Guardians of Cobra Wing')
                    .setDescription('Informações dos últimos 30 dias, enviadas ao [Inara.cz](https://inara.cz/wing-faction-activity/163/) \n' +
                        `**${data.wingName}**  |  Membros: **${data.members}**  |  Naves: **${data.ships}**\n` + 
                        `Estação principal: **${data.headQuarters}**\n\n\n`);
                
                for(let i=0; i < 10; i) {
                    let commander = data.commanders[i];
                    embed.addField(`#${++i}`, `Influência: ${commander.influence}`, true);
                    embed.addField(`${commander.name}`, 
                            `Missões comp.: ${commander.missions} (${commander.percentOfMissions})`, true);
                }
                waitMessage.delete();
                return msg.embed(embed);
            });
        });        
    }
}    