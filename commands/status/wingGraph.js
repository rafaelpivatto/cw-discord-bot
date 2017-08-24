const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);
const dateFormat = require('dateformat');
const logger = require('heroku-logger');
const request = require('request');

const errorMessage = require('../../modules/errorMessage.js');
const mongoConnection = require('../../modules/mongoConnection');
const utils = require('../../modules/utils');
const fileManagement = require('../../modules/fileManagement');

const logName = '[WingGraph]';
const fileDir = '/images/graph/winggraph/';
const fileExtension = '.png';
const wgName = 'Cobra Wing';
const wingUrl = 'https://eddb.io/faction/74863';
const wingColorEmbed = '#f00000';
const UP = '⬆';
const DOWN = '⬇';
const EQUAL = '⬌';
let startGraphDate, endGraphDate;

module.exports = class GraphCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'cwgrafico',
            group: 'status',
            memberName: 'winggraph',
            description: 'Verify CW Graph'
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Initializing process to generate wing graph by user = ' + msg.message.author.username);
        msg.channel.send(':arrows_counterclockwise: Aguarde, o gráfico está sendo gerado...');
        const inicialDate = new Date();
        inicialDate.setDate(inicialDate.getDate() - 9);
        inicialDate.setUTCHours(0, 0, 0, 0);
        const query = {_id : { '$gte' : inicialDate }, wingName: wgName };
        
        mongoConnection.find(logName, query, 'wingData', function(error, results){
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendClientErrorMessage(msg);
            }
            const data = normalizeObjects(results);
            const graphOptions = getGraphOptions();
            
            plotly.plot(data, graphOptions, function (err, res) {
                if (error) {
                    logger.error(logName + ' Error on plotly graph', {'error': error});
                    return errorMessage.sendClientErrorMessage(msg);
                }

                const imageUrl = res.url + '.png';

                request.get({url: imageUrl, encoding: 'binary'}, function (err, response, body) {
                    if (error) {
                        logger.error(logName + ' Error get Imagem from plotly', {'error': error});
                        return errorMessage.sendClientErrorMessage(msg);
                    }

                    const now = dateFormat(utils.getUTCDateNow(), 'yyyymmddHHMMss');
                    const fullFilename =  now + '-' + utils.removeSpaces(wgName) + fileExtension;

                    fileManagement.saveFile(logName, body, fileDir, fullFilename, function(error) {
                        if (error) {
                            logger.error(logName + ' Error to save file = ' + fileDir + fullFilename, {'error': error});
                            return errorMessage.sendClientErrorMessage(msg);
                        }

                        let imageAddress = process.env.BASE_URL + fileDir + fullFilename;
                        logger.info(logName + ' Image address: ' + imageAddress);
                        
                        let embed = new RichEmbed()
                            .setTitle('**Gráfico de influências da ' + wgName + '**')
                            .setDescription('Dados extraídos do [EDDB](' + wingUrl + ')')
                            .setImage(imageAddress)
                            .setColor(wingColorEmbed)
                            .setTimestamp()
                            .setFooter('Fly safe cmdr!');
                        
                        onlyInDev(msg, imageAddress);
                        
                        logger.info(logName + ' Finished process to generate wing graph');

                        msg.client.channels.find('id', msg.channel.id).messages.find('id', msg.client.user.lastMessageID).delete();

                        return msg.embed(embed);
                    });
                });
                logger.info(logName + ' Finished process to generate graph');
            });
        });

        function onlyInDev(msg, imageAddress) {
            if (process.env.ENVIRONMENT === 'DEV') {
                msg.channel.send('', {
                    file: imageAddress
                });
            }
        }

        function normalizeObjects(results) {
            const map = [];
            let count = 0;
            const lastButOneInfluence = [];
            for(let result of results) {
                count = count+1;
                const date = result._id;
                for(let info of result.infos) {
                    const influence = info.influence;
                    if (map[info.systemName] == null) {
                        startGraphDate = utils.getUTCDate(date);
                        map[info.systemName] = {
                            influence: influence,
                            name: info.systemName,
                            y: [
                                influence
                            ],
                            x: [
                                date
                            ],
                            marker: {
                                size: 8
                            },
                            mode: 'lines+markers',
                            line: {
                                shape: 'linear'
                            },
                            type: 'scatter'
                        };
                    } else {
                        endGraphDate = utils.getUTCDate(result.lastUpdate);
                        map[info.systemName].influence = influence;
                        map[info.systemName].y.push(influence);
                        map[info.systemName].x.push(date);
                        if (count > 1) {
                            let name = ' ' + treatInfluence(influence) + utils.rpad('%', 4) + info.systemName;
                            let signal = EQUAL;
                            if (lastButOneInfluence[info.systemName] > influence) {
                                signal = DOWN;
                            } else if (lastButOneInfluence[info.systemName] < influence) {
                                signal = UP;
                            }
                            map[info.systemName].name = signal + name;
                        }
                        lastButOneInfluence[info.systemName] = influence;
                    }
                }
            }
            let resultNormalized = [];
            for (let key in map) {
                resultNormalized.push(map[key]);
            }
            resultNormalized.sort(sortFunction);
            return resultNormalized;
        }

        function sortFunction(a, b) {
            if (a.influence === b.influence) {
                return 0;
            } else {
                return (a.influence > b.influence) ? -1 : 1;
            }
        }

        function treatInfluence(influence) {
            let inf = influence;
            if (inf.toString().indexOf('.') == -1) {
                inf += '.0';
            }
            return utils.lpad(inf, 6);
        }

        function getGraphOptions() {
            return {
                fileopt : 'overwrite', 
                filename : 'cwgraph',
                style: {
                    type: 'scatter'
                },
                layout: {
                    title: wgName + ' - período: ' + 
                        dateFormat(startGraphDate, 'dd/mm/yyyy') +
                        ' à ' + dateFormat(endGraphDate, 'dd/mm/yyyy') + ' UTC',
                    legend: {
                        font: {
                            size: 12
                        },
                        borderwidth: 1
                    },
                    xaxis: {
                        title: 'Informações atualizadas pela última vez às ' + 
                                dateFormat(endGraphDate, 'HH:MM') + ' UTC',
                        tickformat: '%d/%m',
                        nticks: 11,
                        type: 'date',
                        autorange: true,
                        range: [
                            '2017-07-01',
                            '2017-07-10'
                        ]
                    },
                    yaxis: {
                        ticksuffix: ' %',
                        tickmode: 'linear',
                        dtick: 10,
                        range: [
                            -1,
                            101
                        ],
                        type: 'linear',
                        autorange: false
                    }
                }
            };
        }
    }
}