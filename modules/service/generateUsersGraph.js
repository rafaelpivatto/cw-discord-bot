const logger = require('heroku-logger');
const plotly = require('plotly')(process.env.PLOTLY_USER,process.env.PLOTLY_PASS);
const request = require('request');
const dateFormat = require('dateformat');

const usersJoinAndLeft = require('../service/usersJoinAndLeft.js');
const utils = require('../utils.js');
const fileManagement = require('../service/fileManagement.js');

const logName = '[GenerateUsersGraph]';
const fileDir = '/images/graph/usersgraph/';
const fileExtension = '.png';
const wgName = 'Cobra Wing';
const legends = [];

exports.generate = (logPrefix, callback) => {

    logger.info(logPrefix + logName + ' Starting generate');

    usersJoinAndLeft.get(logName, (err, data) => {
        if (err) {
            logger.error(logName + ' Error on retrieving informations', {'error': error});
            callback('Houve um erro ao gerar o gráfico, tente novamente em breve, Fly safe, CMDR!');
        }
        if (!data || data.length === 0) {
            logger.error(logName + ' Error on retrieving informations', {'error': error});
            callback('Nenhum dado foi encontrado para gerar o gráfico.');
        }

        const dataTraces = getTraces(data);
        const options = {
            fileopt : 'overwrite', 
            filename : 'lastusers',
            layout: getLayout()
        }

        plotly.plot(dataTraces, options, (err, res) => {
            if (err) {
                logger.error(logName + ' Error on plotly graph', {'error': err});
                callback('Houve um problema ao gerar o gráfico.');
            }

            const imageUrl = res.url + '.png';

            request.get({url: imageUrl, encoding: 'binary'}, function (err, response, body) {
                if (err) {
                    logger.error(logName + ' Error get Imagem from plotly', {'error': err});
                    callback('Houve um problema ao gerar o gráfico.');
                }

                const now = dateFormat(utils.getUTCDateNow(), 'yyyymmddHHMMss');
                const fullFilename =  now + '-' + utils.removeSpaces(wgName) + fileExtension;

                fileManagement.saveFile(logName, body, fileDir, fullFilename, function(err) {
                    if (err) {
                        logger.error(logName + ' Error to save file = ' + fileDir + fullFilename, {'error': err});
                        callback('Houve um problema ao gerar o gráfico.');
                    }

                    let imageAddress = process.env.BASE_URL + fileDir + fullFilename;
                    
                    logger.info(logName + ' Image address: ' + imageAddress);
                    logger.info(logName + ' Finished process to generate wing graph');

                    callback(null, imageAddress);
                });
            });
        });
    });

    const getTraces = (data) => {

        let totalTrace1 = 0;
        let trace1 = getTraceTemplate();
        let totalTrace2 = 0;
        let trace2 = getTraceTemplate();
        
        for (let i=0 ; i < data.length ; i++) {
            trace1.x.push(data[i].date);
            trace1.y.push(data[i].join);
            trace2.x.push(data[i].date);
            trace2.y.push(data[i].left);
            legends.push({
                x: i, 
                y: -0.165, 
                showarrow: false, 
                text: data[i].join + '-' + data[i].left, 
                xref: 'x', 
                yref: 'paper'
            });
            totalTrace1 += data[i].join;
            totalTrace2 += data[i].left;
        }

        trace1.marker.color = 'rgb(0, 56, 255)';
        trace1.name = 'Entraram ' + totalTrace1 + ' membros';

        trace2.marker.color = 'rgb(255, 0, 0)';
        trace2.name = 'Saíram ' + totalTrace2 + ' membros';

        return [trace1, trace2];
    };

    const getTraceTemplate = () => {
        return traceTemplate = {
            x: [],
            y: [],
            marker: {
                line: {
                    width: -0.5
                }
            },
            opacity: 1,
            orientation: 'v', 
            showlegend: true, 
            type: 'bar'
        };
    }

    const getLayout = () => {
        const data = {
            annotations: [
                {
                    x: -0.0939194316322, 
                    y: 1.10901515152, 
                    align: 'center', 
                    arrowcolor: '', 
                    arrowhead: 1, 
                    arrowsize: 1, 
                    arrowwidth: 0, 
                    ax: -10, 
                    ay: -26.7109375, 
                    bgcolor: 'rgba(0, 0, 0, 0)', 
                    bordercolor: '', 
                    borderpad: 1, 
                    borderwidth: 1, 
                    font: {
                        color: 'rgb(67, 67, 67)', 
                        family: '', 
                        size: 20
                    }, 
                    opacity: 1, 
                    showarrow: false, 
                    text: 'Membros que chegaram/saíram do Discord Cobra Wing - útimos 10 dias', 
                    xref: 'paper', 
                    yref: 'paper'
                }, 
                {
                    x: 1.20596153846, 
                    y: 0.8648, 
                    showarrow: false, 
                    text: 'Legenda e totais', 
                    xref: 'paper', 
                    yref: 'paper'
                }
            ], 
            autosize: false, 
            bargap: 0.1, 
            bargroupgap: 0, 
            barmode: 'group', 
            boxgap: 0.3, 
            boxgroupgap: 0.3, 
            boxmode: 'overlay', 
            dragmode: 'pan', 
            font: {
                color: '#000', 
                family: 'Open Sans, sans-serif', 
                size: 12
            }, 
            height: 400, 
            hovermode: false, 
            legend: {
                x: 0.9975, 
                y: 0.802878787879, 
                bgcolor: 'rgba(255, 255, 255, 0)', 
                bordercolor: 'rgba(0, 0, 0, 0)', 
                borderwidth: 1, 
                font: {
                    color: 'rgb(67, 67, 67)', 
                    family: '', 
                    size: 14
                }, 
                orientation: 'v', 
                traceorder: 'normal', 
                xanchor: 'left'
            }, 
            margin: {
                r: 200, 
                t: 40, 
                b: 60, 
                l: 80, 
                pad: 2
            }, 
            paper_bgcolor: 'rgb(255, 255, 255)', 
            plot_bgcolor: 'rgb(255, 255, 255)', 
            showlegend: true, 
            title: '<br>', 
            titlefont: {
                color: 'rgba(0, 0, 0, 0)', 
                family: 'Open Sans, sans-serif', 
                size: 0
            }, 
            width: 800, 
            xaxis: {
                autorange: true, 
                domain: [0, 1],
                dtick: 14, 
                exponentformat: 'none', 
                fixedrange: false, 
                gridcolor: '#ddd', 
                gridwidth: 1, 
                linecolor: 'rgb(67, 67, 67)', 
                linewidth: 1, 
                mirror: false, 
                nticks: 12, 
                range: [-0.5, 9.5], 
                showexponent: 'all', 
                showgrid: false, 
                showticklabels: true, 
                showtickprefix: 'all', 
                side: 'bottom', 
                tick0: 0, 
                tickangle: 'auto', 
                tickcolor: 'rgba(0, 0, 0, 0)', 
                tickfont: {
                    color: 'rgb(67, 67, 67)', 
                    family: '', 
                    size: 13
                }, 
                ticklen: 0, 
                tickmode: 'auto', 
                tickprefix: '', 
                ticks: 'outside', 
                tickwidth: 1, 
                title: '<br>', 
                titlefont: {
                    color: 'rgba(0, 0, 0, 0)', 
                    family: '', 
                    size: 12
                }, 
                type: 'category', 
                zeroline: false, 
                zerolinecolor: '#000', 
                zerolinewidth: 1
            }, 
            yaxis: {
                anchor: 'x', 
                autorange: true, 
                domain: [0, 1], 
                dtick: 2, 
                exponentformat: 'B', 
                gridcolor: 'rgb(237, 237, 237)', 
                gridwidth: 1, 
                linecolor: 'rgba(0, 0, 0, 0)', 
                linewidth: 0, 
                mirror: true, 
                nticks: 20, 
                position: 0.01, 
                range: [0, 14.7368421053], 
                showexponent: 'all', 
                showgrid: true, 
                showline: true, 
                showticklabels: true, 
                showtickprefix: 'first', 
                showticksuffix: 'last', 
                side: 'left', 
                tick0: 0, 
                tickangle: 'auto', 
                tickcolor: '#000', 
                tickfont: {
                    color: 'rgb(67, 67, 67)', 
                    family: '', 
                    size: 12
                }, 
                ticklen: 5, 
                tickmode: 'linear', 
                tickprefix: '', 
                ticks: 'outside', 
                ticksuffix: '', 
                tickwidth: 1, 
                title: '<br>', 
                titlefont: {
                    color: 'rgba(0, 0, 0, 0)', 
                    family: '', 
                    size: 12
                }, 
                type: 'linear', 
                zeroline: false, 
                zerolinecolor: '#000', 
                zerolinewidth: 1
            }
        };
        data.annotations = data.annotations.concat(legends);
        data.annotations.push({
            x: -0.1394,
            y: -0.16,
            showarrow: false,
            text: 'Entrou/Saiu:',
            xref: 'paper',
            yref: 'paper'
        });
        data.annotations.push({
            x: -0.0663461538462,
            y: -0.08,
            showarrow: false,
            text: 'Data:',
            xref: 'paper',
            yref: 'paper'
        });
        return data;
    };
};