const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const request = require('request');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);

const errorMessage = require('../../modules/message/errorMessage.js');
const searchSystemsByNamesFromEdsm = require('../../modules/gateway/searchSystemsByNamesFromEdsm.js');
const utils = require('../../modules/utils.js');
const fileManagement = require('../../modules/service/fileManagement.js');

const logName = '[systemsDistance]';
const fileDir = '/images/graph/systemsDistance/';
const fileExtension = '.png';
const wingName = 'Cobra Wing';
const wingColorEmbed = '#f00000';

module.exports = class SystemsDistanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'distancia',
            group: 'system',
            memberName: 'systemsdistancecalc',
            description: 'Calc the distance between two systems',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        if (!checkApplyRequirements()) {
            logger.warn(logName + ' not apply requirements');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Este comando está desabilitado.');
        }

        if (!args) {
            logger.warn(logName + ' No args aware, command error returned.');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Comando inválido, execute !distancia "SistemaA" "SistemaB" \n' + 
                '* Nomes entre aspas e separados por espaço.');
        }
        
        let systemNames = args.split("\" \"");
        if (systemNames.length === 0) {
            systemNames = args.split("' '");
        }
        if (systemNames.length != 2) {
            logger.warn(logName + ' Args error, command error returned.', systemNames);
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Comando inválido, execute !distancia "SistemaA" "SistemaB" \n' + 
                '* Nomes entre aspas e separados por espaço.');
        }

        logger.info(logName + ' System names = ' + systemNames);

        msg.channel.send({'embed': new RichEmbed()
            .setColor(wingColorEmbed)
            .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
            .setTimestamp()
            .setFooter('Fly safe cmdr!')
            .setDescription(':arrows_counterclockwise: Aguarde um instante, calculando a distância...')}).then(waitMessage => {

            searchSystemsByNamesFromEdsm.getSystemCoordinates(logName, systemNames).then(response => {
                if (response.length === 0) {
                    logger.error(logName + ' Systems not found');
                    waitMessage.delete();
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        'Nenhum dos dois sistemas foram encontrados, verifique os nomes e tente novamente.'
                    );
                } else if (response.length !== 2) {
                    const systemNameNotFound = systemNames.filter(n => n.toUpperCase() != response[0].name.toUpperCase())[0].toUpperCase();
                    logger.error(logName + ' One system not found');
                    waitMessage.delete();
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        `O sistema **${systemNameNotFound}** não foi encontrado, verifique o nome.`
                    );
                } else {

                    //(x1-x2)²
                    const x1 = response[0].coords.x;
                    const x2 = response[1].coords.x;
                    const x = Math.pow((x1 - x2), 2);
                    //(y1-y2)²
                    const y1 = response[0].coords.y;
                    const y2 = response[1].coords.y;
                    const y = Math.pow((y1 - y2), 2);
                    //(z1-z2)²
                    const z1 = response[0].coords.z;
                    const z2 = response[1].coords.z;
                    const z = Math.pow((z1 - z2), 2); 

                    const distance = Math.sqrt(x + y + z).toFixed(2);

                    let embed = new RichEmbed()
                        .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                        .setDescription('* *Calculados a partir de dados do EDSM*\n\n' + 
                            `A distância entre os sistemas **${systemNames[0].toUpperCase()}** e **${systemNames[1].toUpperCase()}** ` +
                            `é de aproximadamente **${distance}Ly**\n\n` +
                            'Essa distância é considerada em linha reta, ' +
                            'podendo ser maior conforme o planejamento de rota.')
                        .setColor(wingColorEmbed)
                        .setTimestamp()
                        .setFooter('Fly safe cmdr!');
                    
                    logger.info(logName + ' Finished process to calculate distance between systems');
                    waitMessage.delete();
                    return msg.embed(embed);
                }
            })
            .catch(error => {
                waitMessage.delete();
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O EDSM não deu permissão para o bot fazer docking, aguarde um instante e tente novamente em breve, Fly safe CMDR!'
                );
            });
        }).catch(console.log);

        const onlyInDev = (msg, imageAddress) => {
            if (process.env.ENVIRONMENT === 'DEV') {
                msg.channel.send('', {
                    file: imageAddress
                });
            }
        }

        function checkApplyRequirements() {
            return process.env.BASE_URL && process.env.PLOTLY_USER && process.env.PLOTLY_PASS;
        }
    }
    
}    
