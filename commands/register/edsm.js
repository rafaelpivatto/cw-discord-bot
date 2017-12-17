const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const getFromUrl = require('../../modules/gateway/getFromUrl.js');
const mongoConnection = require('../../modules/connection/mongoConnection.js');

const logName = '[CWAjuda]';
const wingColor = '#f00000';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'edsm',
            group: 'register',
            memberName: 'edsm',
            description: 'Link user to edsm',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        if (!args || args === '') {
            logger.info(logName + ' invalid association to edsm: ');
            return errorMessage.sendSpecificClientErrorMessage(msg, 
                'Para associar seu usuário do EDSM no discord, execute o comando !edsm link_do_edsm', ' ');
        }
        let commanderName = args;
        if (args.indexOf('edsm.net') !== -1) {
            commanderName = args.substring(args.indexOf('cmdr/')+5);
        } 

        getFromUrl.get(logName, 'https://www.edsm.net/api-logs-v1/get-position?commanderName=' + 
            commanderName, (error, json) => {
            
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O EDSM não deu permissão para o bot fazer docking, aguarde um instante e tente novamente em breve, Fly safe, CMDR!'
                );
            }

            if (json.msgnum === 203) {
                logger.info(logName + ' commander not found: ' + commanderName);
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O perfil do comandante não foi encontrado no EDSM, verifique se a URL esta correta.');
            }

            if (!json.system) {
                logger.info(logName + ' commander don\'t have public profile: ' + commanderName);
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O perfil não é público no EDSM, garanta essa configuração e tente novamente.');
            }
            const data = {
                _id: msg.author.id,
                user: utils.getUserNickName(msg) + '#' + msg.message.author.discriminator,
                url: json.url,
                commanderName: commanderName,
                createDate: new Date()
            };
            mongoConnection.saveOrUpdate(logName, data, 'cwUsers', () => {
                if (error) {
                    logger.error(logName + ' error to save user on data base', {'error': error});
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        'O EDSM não deu permissão para o bot fazer docking, aguarde um instante e tente novamente em breve, Fly safe, CMDR!'
                    );
                }

                let embed = new RichEmbed()
                    .setColor(wingColor)
                    .setTimestamp()
                    .setTitle('Usuário discord vinculado ao EDSM')
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setFooter('Fly safe cmdr!')
                    .setDescription('Tudo ok, seu usuário do discord foi associado ao EDSM informado.\n' + 
                        'Para fazer consultas agora esse usuário pode ser encontrado usando:\n' + 
                        '**!cmdr @usuario**'
                    );
                return msg.embed(embed);
            });
        });
    }
};