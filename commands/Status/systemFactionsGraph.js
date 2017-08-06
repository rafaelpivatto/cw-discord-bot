const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const dateFormat = require('dateformat');
const request = require('request');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);

const errorMessage = require('../../modules/errorMessage.js');
const searchSystemFactionFromEdsm = require('../../modules/searchSystemFactionFromEdsm');
const utils = require('../../modules/utils');
const fileManagement = require('../../modules/fileManagement');

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
            group: 'status',
            memberName: 'systemfactionsgraph',
            description: 'Retrieve status for system factions'
        });
    }

    async run(msg, args) {
        const systemName = String(args).toUpperCase();
        logger.info('[systemFactionsGraph] Generate system factions graph by user = ' + msg.message.author.username);
        logger.info('[systemFactionsGraph] System name = ' + systemName);
        if (!systemName) {
            logger.warn('[systemFactionsGraph] Error on retrieving informations');
            return msg.channel.send(':warning: Comando inválido, execute !sistema <NOME DO SISTEMA>');
        }
        searchSystemFactionFromEdsm.get(systemName, function(error, body){
            const json = JSON.parse(body);
            if (error) {
                logger.error('[systemFactionsGraph] Error on retrieving informations');
                return errorMessage.sendClientErrorMessage(msg);
            }
            if (json.length === 0) {
                logger.info('[systemFactionsGraph] System "' + systemName + '" not found');
                return msg.channel.send('O sistema "' + systemName + '" não foi encontrado! tem certeza que é o sistema certo? :thinking:');
            }
            if (json.factions.length === 0) {
                logger.info('[systemFactionsGraph] System "' + systemName + '" not found minor factions');
                return msg.channel.send('O sistema "' + systemName + '" não tem facções :neutral_face:');
            }
            msg.channel.send(':arrows_counterclockwise: Aguarde, o gráfico está sendo gerado...');
            const data = normalizeObjects(json);
            const graphOptions = getGraphOption(systemName, json.controllingFaction.name);
            
            plotly.plot(data, graphOptions, function (err, res) {
                if (error) {
                    logger.error('[systemFactionsGraph] Error on plotly system factions graph', error);
                    return errorMessage.sendClientErrorMessage(msg);
                }

                const imageUrl = res.url + '.png';
                request.get({url: imageUrl, encoding: 'binary'}, function (err, response, body) {
                    if (error) {
                        logger.error('[systemFactionsGraph] Error get Imagem from plotly', error);
                        return errorMessage.sendClientErrorMessage(msg);
                    }
                    
                    const now = dateFormat(utils.getUTCDateNow(), 'yyyymmddHHMMss');
                    const fullFilename =  now + '-' + systemName + fileExtension;

                    fileManagement.saveFile(body, fileDir, fullFilename, function(error) {
                        if (error) {
                            logger.error('[systemFactionsGraph] Error to save file = ' + fileDir + fullFilename);
                            return errorMessage.sendClientErrorMessage(msg);
                        }
                        
                        let imageAddress = process.env.BASE_URL + fileDir + fullFilename;
                        logger.info('[systemFactionsGraph] Image address: ' + imageAddress);
                        
                        let embed = new RichEmbed()
                            .setTitle('**Influências em ' + systemName + '**')
                            .setDescription('Dados extraídos do [EDSM](https://www.edsm.net/)')
                            .setImage(imageAddress)
                            .setColor(wingColorEmbed)
                            .setTimestamp()
                            .setFooter('Fly safe cmdr!');
                        
                        onlyInDev(msg, imageAddress);
                        
                        logger.info('[systemFactionsGraph] Finished process to generate system factions graph');

                        return msg.embed(embed);
                    });
                });
            });
        });

        function normalizeObjects(json) {
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
                const isThisWing = String(faction.name).toUpperCase() === wingName.toUpperCase();
                const color = isThisWing ? wingColor : defaultColors[i];
                const influence = Math.round(faction.influence * 100);
                if (influence <= 0) continue;
                data[0].labels.push(faction.name + playerFactionIcon(faction));
                data[0].marker.colors.push(color);
                data[0].values.push(influence);
            }

            return data;
        };

        function playerFactionIcon(faction) {
            return faction.isPlayer ? ' (Player faction)' : '';
        }

        function getGraphOption(systemName, wingControlledName) {
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

        function onlyInDev(msg, imageAddress) {
            if (process.env.ENVIRONMENT === 'DEV') {
                msg.channel.send('', {
                    file: imageAddress
                });
            }
        }
    }
    
}    