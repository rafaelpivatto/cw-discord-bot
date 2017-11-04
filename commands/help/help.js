const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');

const doubleWrapLine = '\n\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingColor = '#f00000';
const logName = '[CWAjuda]';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwajuda',
            group: 'help',
            memberName: 'help',
            aliases: ['cwhelp'],
            description: 'Help for CW bot',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        
        utils.logMessageUserExecuteCommand(logName, 'cwajuda', msg);
        
        let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('Comandos do CobraWingBot')
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setDescription(
                    '**!cwstatus** - *Status dos sistemas onde a Cobra Wing está presente.*' + doubleWrapLine +
                    '**!cwgrafico** - *Gráfico de influência dos últimos 10 dias desses sitemas onde a Cobra Wing está presente.*' + doubleWrapLine +
                    '**!sistema <nome_sistema>** - *Gráfico das influências das facções no sistema informado, estando ou não a Cobra Wing presente. Ex: !sistema ebor*' + doubleWrapLine +
                    '**!utilidades** - *Conjunto de sites extremente úteis para auxiliar na jobabilidade.*' + doubleWrapLine +
                    '**!elitestatus** - *Status do servidor do Elite: Dangerous (online, offline, etc).*' + doubleWrapLine +
                    '**!cwjogando** - *Jogadores online no discord e o que estão jogando.*' + doubleWrapLine +
                    '**!science** - *Todos os comandos de science.*' + doubleWrapLine +
                    '**!memes** - *Todos os comandos de memes.*' + doubleWrapLine +
                    '**!ranks** - *Todos os comandos de ranks.*' + doubleWrapLine +
                    '**!cwping** - *Exibe o tempo de ping entre você e o discord.*'
                );

        return msg.embed(embed);
    }
}    