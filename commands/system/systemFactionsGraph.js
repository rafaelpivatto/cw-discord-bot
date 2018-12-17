const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const dateFormat = require('dateformat');
const request = require('request');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);

const errorMessage = require('../../modules/message/errorMessage.js');
const searchSystemFactionFromEdsm = require('../../modules/gateway/searchSystemFactionFromEdsm.js');
const utils = require('../../modules/utils.js');
const fileManagement = require('../../modules/service/fileManagement.js');

const logName = '[SystemFactionsGraph]';
const fileDir = '/images/graph/systemfactions/';
const fileExtension = '.png';
const wingName = 'Cobra Wing';
const wingColor = 'rgb(255, 51, 51)';
const wingColorEmbed = '#f00000';
const defaultColors = ['rgb(255, 204, 153)', 'rgb(255, 255, 153)', 'rgb(204, 255, 153)', 'rgb(153, 255, 255)',
                'rgb(153, 204, 255)', 'rgb(153, 153, 255)', 'rgb(255, 153, 255)', 'rgb(192, 192, 192)',
                'rgb(204, 255, 153)', 'rgb(153, 255, 255)', 'rgb(0, 0, 128)', 'rgb(192, 192, 192)'];

module.exports = class SystemFactionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sistema',
            group: 'system',
            memberName: 'systemfactionsgraph',
            description: 'Retrieve status for system factions',
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
        
        const systemName = utils.removeDiacritics(String(args)).toUpperCase();
        logger.info(logName + ' System name = ' + systemName);

        if (!systemName) {
            logger.warn(logName + ' Error on retrieving informations, error command.');
            return errorMessage.sendSpecificClientErrorMessage(msg, 'Comando inválido, execute !sistema <NOME DO SISTEMA>');
        }

        searchSystemFactionFromEdsm.get(logName, systemName, function(error, body, url){

            if (error || !body) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O EDSM não deu permissão para o bot fazer docking, aguarde um instante e tente novamente em breve, Fly safe CMDR!'
                );
            }

            const json = JSON.parse(body);

            if (!json.length && json.length === 0) {
                logger.info(logName + ' System "' + systemName + '" not found');
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O sistema "' + systemName + '" não foi encontrado! Está correto o nome do sistema? :thinking:');
            }

            if (json.factions.length === 0) {
                logger.info(logName + ' System "' + systemName + '" not found minor factions');
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O sistema "' + systemName + '" não tem facções :neutral_face:');
            }

            msg.channel.send({'embed': new RichEmbed()
                .setColor(wingColor)
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setTimestamp()
                .setFooter('Fly safe cmdr!')
                .setDescription(':arrows_counterclockwise: Aguarde um instante, o gráfico está sendo gerado...')}).then(waitMessage => {
                
                const data = normalizeObjects(json);
                const graphOptions = getGraphOption(systemName, json.controllingFaction.name);
                
                plotly.plot(data, graphOptions, function (error, res) {
                    if (error || !res) {
                        logger.error(logName + ' Error on plotly system factions graph', {'error': error});
                        waitMessage.delete();
                        return errorMessage.sendSpecificClientErrorMessage(msg, 
                            'Os :alien: impediram o gráfico de ser gerado, tente novamente, parece que *já se foi o disco voador*.');
                    }

                    const imageUrl = res.url + '.png';
                    request.get({url: imageUrl, encoding: 'binary'}, function (error, response, body) {
                        if (error) {
                            logger.error(logName + ' Error get Imagem from plotly', {'error': error});
                            waitMessage.delete();
                            return errorMessage.sendClientErrorMessage(msg);
                        }
                        
                        const now = dateFormat(utils.getUTCDateNow(), 'yyyymmddHHMMss');
                        const fullFilename =  now + '-' + utils.removeSpaces(systemName) + fileExtension;

                        fileManagement.saveFile(logName, body, fileDir, fullFilename, function(error) {
                            if (error) {
                                logger.error(logName + ' Error to save file = ' + fileDir + fullFilename, {'error': error});
                                waitMessage.delete();
                                return errorMessage.sendClientErrorMessage(msg);
                            }
                            
                            let imageAddress = process.env.BASE_URL + fileDir + fullFilename;
                            logger.info(logName + ' Image address: ' + imageAddress);
                            
                            const urlFormatted = String(url).replace(/ /g, '%20');
                            let embed = new RichEmbed()
                                .setTitle('**Influências em ' + systemName + '**')
                                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                                .setDescription('Dados extraídos do [EDSM](' + urlFormatted + ')')
                                .setImage(imageAddress)
                                .setColor(wingColorEmbed)
                                .setTimestamp()
                                .setFooter('Fly safe cmdr!');
                            
                            onlyInDev(msg, imageAddress);
                            
                            logger.info(logName + ' Finished process to generate system factions graph');
                            waitMessage.delete();
                            return msg.embed(embed);
                        });
                    });
                });
            }).catch(console.log);
        });

        const normalizeObjects = (json) => {
            let data = [
                {   
                    textfont: {
                        size: 10
                    },
                    sort: true,
                    pull: 0,
                    direction: 'clockwise',
                    opacity: 1,
                    labels: [],
                    marker: {
                        line: {
                            width: 0.5
                        },
                        colors: []
                    },
                    values: [],
                    textposition: 'outside',
                    textinfo: 'label%2Bpercent',
                    rotation: -45,
                    hole: 0,
                    type: 'pie'
                },
            ];

            for (let i = 0; i < json.factions.length ; i++) {
                const faction = json.factions[i];
                const thisWing = String(faction.name).toUpperCase() === wingName.toUpperCase();
                const color = thisWing ? wingColor : defaultColors[i];
                const influence = Math.round(faction.influence * 100);
                let factionname = String(faction.name).replace(new RegExp('&', 'g'), 'and');
                if (influence <= 0) continue;
                data[0].labels.push(factionname + playerFactionIcon(faction));
                data[0].marker.colors.push(color);
                data[0].values.push(influence);
            }

            return data;
        };

        const playerFactionIcon = (faction) => {
            return faction.isPlayer ? ' (Player faction)' : '';
        }

        const getGraphOption = (systemName, wingControlledName) => {
            return {
                fileopt : 'overwrite', 
                filename : 'systemFactions',
                layout: {
                    title: '<b>' + systemName + '</b> - <b>' + 
                            dateFormat(utils.getUTCDateNow(), 'dd/mm/yyyy HH:MM') + '</b> UTC<br>Facção controladora: <b>' + 
                            wingControlledName + '</b>',
                    autosize: true,
                    showlegend: false,
                    margin: {
                        t: 100
                    },
                    legend: {
                        y: -0.03763376285725584,
                        x: 0.24635761589403973,
                        font: {
                            size: 13
                        },
                        orientation: 'h',
                        traceorder: 'normal'
                    },
                }
            };
        }

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
