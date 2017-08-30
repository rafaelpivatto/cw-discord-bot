const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const utils = require('../../modules/utils.js');

const doubleWrapLine = '\n\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingUrlSite = 'http://elitedangerouscobra.com.br';
const wingColor = '#f00000';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwhelp',
            group: 'help',
            memberName: 'help',
            aliases: ['cwajuda'],
            description: 'Help for CW bot'
        });
    }

    async run(msg, args) {
        if (utils.blockDirectMessages(msg)) return;
        
        logger.info('[Help] Execute help command by user = ' + msg.message.author.username);
        
        let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('**Comandos do CobraWingBot**')
                .setThumbnail(wingThumb)
                .setFooter('Fly safe cmdr!')
                .setURL(wingUrlSite)
                .setDescription(
                    '**!cwstatus** *Exibe os status dos sistemas onde a Cobra Wing está presente.*' + doubleWrapLine +
                    '**!cwgrafico** *Exibe um gráfico de influência dos últimos 10 dias desses sitemas onde a Cobra Wing está presente.*' + doubleWrapLine +
                    '**!sistema <nome_sistema>** *Exibe um grafico das influências das facções no sistema informado, estando ou não a Cobra Wing presente. Ex: !sistema ebor*' + doubleWrapLine +
                    '**!cwping** *Um simples comando para o bot dar um sinal de vida.*' + doubleWrapLine +
                    '**!cwjogando** *Exibe quantos jogares online no discord e jogando Elite:Dangerous.*' + doubleWrapLine +
                    '**!cwhelp** *Exibe essas informações de ajuda.*'
                );

        return msg.embed(embed);
    }
}    