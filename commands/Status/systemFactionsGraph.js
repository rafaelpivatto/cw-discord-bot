const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const dateFormat = require('dateformat');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);

const errorMessage = require('../../modules/errorMessage.js');
const searchSystemFactionFromEdsm = require('../../modules/searchSystemFactionFromEdsm');
const utils = require('../../modules/utils');

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
                return msg.channel.send('O sistema "' + systemName + '" não foi encontrado! tem certeza que digitou certo? :thinking:');
            }
            msg.channel.send(':arrows_counterclockwise: Aguarde, o gráfico está sendo gerado...');
            const data = normalizeObjects(json);
            const graphOptions = getGraphOption(systemName, json.controllingFaction.name);
            
            plotly.plot(data, graphOptions, function (err, res) {
                if (error) {
                    logger.error('[systemFactionsGraph] Error on plotly system factions graph', error);
                    return errorMessage.sendClientErrorMessage(msg);
                }
                //msg.channel.send('', {
                //    file: res.url + '.png'
                //});
                
                
                let embed = new RichEmbed()
                    //.setImage(res.url + '.png')
                    //.setImage("http://plot.ly/~rafael.pivatto/14.png")
                    .setImage("teste.png")
                    .setColor(wingColorEmbed)
                    .setTimestamp()
                    .setFooter('Fly safe cmdr!')
                    .attachFile('teste.png');

                    //embed.file("attachment://teste.png");
                
                logger.info('[systemFactionsGraph] Finished process to generate system factions graph');

                /*return msg.channel.send({
                        embed: {
                            color: 3447003,
                            description: "teste",
                            image: {
                                url: "teste.png"
                                //url: "http://i.imgur.com/pasTM5S.png"
                            }
                        }
                    });*/
                return msg.embed(embed);
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
                            width: 0
                        },
                        colors: []
                    },
                    values: [],
                    textposition: 'outside',
                    textinfo: 'percent',
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
                data[0].labels.push(faction.name);
                data[0].marker.colors.push(color);
                data[0].values.push(influence);
            }

            return data;
        };

        function getGraphOption(systemName, wingControlledName) {
            return {
                fileopt : 'overwrite', 
                filename : 'systemFactions',
                layout: {
                    title: 'Influencias das facções no sistema <b>' + systemName + '</b> em <b>' + 
                            dateFormat(utils.getUTCDateNow(), 'dd/mm/yyyy HH:MM') + '</b> UTC<br>Facção controladora: <b>' + 
                            wingControlledName + '</b>',
                    autosize: true,
                    legend: {
                        y: -0.03763376285725575,
                        x: 0.24635761589403973,
                        font: {
                            size: 13
                        },
                        orientation: 'h',
                        traceorder: 'normal'
                    },
                    showlegend: true
                }
            };
        }
    }
    
}    