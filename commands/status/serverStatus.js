const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const dateFormat = require('dateformat');

const errorMessage = require('../../modules/message/errorMessage.js');
const getServerStatusFromEdsm = require('../../modules/service/getServerStatusFromEdsm.js');

const logName = '[Ping]';
const doubleWrapLine = '\n\n';
const wingColor = '#f00000';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'elitestatus',
            group: 'status',
            memberName: 'elitestatus',
            description: 'Check server status',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Execute check server status by user = ' + msg.message.author.username);
        
        getServerStatusFromEdsm.getServerStatus(logName, function(error, currentServerStatus) {

            if (error || !currentServerStatus || currentServerStatus.length === 0) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'Erro ao verificar o status dos servidores do Elite: Dangerous, serão os thargoids??? :rolling_eyes:'
                );
            }

            const info = getByStatus(currentServerStatus);
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('Elite: Dangerous')
                .setThumbnail(info.thumb)
                .setFooter('Fly safe cmdr!')
                .setDescription(info.message);

            return msg.embed(embed);
        });

        //--- methrods ---
        function getByStatus(currentServerStatus) {
            let obj = {};
            const defaultMessage = '\n\n__Última atualização:__ ' +
                        dateFormat(currentServerStatus.lastUpdate, 'dd/mm/yyyy HH:MM:ss') + ' UTC' +
                        doubleWrapLine +
                        '*OBS.: Consulta realizada através do EDSM, ' +
                        'poderão ocorrer equivocos devido a falhas de comunicação com o servidor.*';
            
                        switch(currentServerStatus.status) {
                case 2:
                    obj.message = '**O servidor do Elite:Dangerous está __ONLINE__ e funcionando normalmente!**';
                    obj.thumb = 'http://i.imgur.com/GD5yfU3.png';
                    break;

                case 1:
                    obj.message = '**O servidor do Elite:Dangerous está com algumas __instabilidades__!**' + doubleWrapLine +
                                  '__Atenção:__ você poderá sofrer desconexões...';
                    obj.thumb = 'http://i.imgur.com/wBA85oa.png';    
                    break;

                case 0:
                    obj.message = '**O servidor do Elite:Dangerous está __OFFLINE__!!!**' + doubleWrapLine +
                                  '__Possíveis causas:__' + doubleWrapLine +
                                  '- Manutenção dos servidores;\n' +
                                  '- Atualização do jogo;\n' +
                                  '- Ataques Thargoid :alien:.\n';  
                    break;
            }
            obj.message += defaultMessage;
            return obj
        }
    }
}    