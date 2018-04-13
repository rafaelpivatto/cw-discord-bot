const schedule = require('node-schedule');
const logger = require('heroku-logger');
const cheerio = require('cheerio');
const { RichEmbed } = require('discord.js');
const BitlyClient = require('bitly');
let bitly;

const getFromUrl = require('../gateway/getFromUrl.js');
const mongoConnection = require('../connection/mongoConnection.js');
const utils = require('../utils.js');

const wingColor = '#f00000';
const wrapLine = '\n';
const thumb = 'https://i.imgur.com/Ig6OgUj.png';

const logName = '[GalnetJob]';
const url = 'https://community.elitedangerous.com/en/galnet/';

exports.execute = (client) => {
    
    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        if (process.env.BITLY_KEY) bitly = BitlyClient(process.env.BITLY_KEY);
        
        //Execute every hour **:02 
        schedule.scheduleJob('2 * * * *', () => {

            if (!process.env.GUILD_ID || !process.env.GALNET_INFO_CHANNEL) return;

            const guild = client.guilds.find('id', process.env.GUILD_ID);

            if (!guild) return;
            
            logger.info(logName + ' started...');
            const channel = guild.channels.find('name', process.env.GALNET_INFO_CHANNEL);
                    
            if (channel) {
                const query = {_id: 'GALNET_INFO'}
                mongoConnection.find(logName, query, 'notify', (error, results) => {
                    if (error) {
                        logger.error(logName + ' Error on retrieving informations', {'query': query, 'error': error});
                    }

                    if (results.length == 0 || results.length > 0) {
                        const fullUrl = url + getDate();
                        getFromUrl.getHtml(logName, fullUrl, (error, body) => {
                            
                            if (error) return;

                            let dataToSave = {
                                _id: 'GALNET_INFO',
                                updateDate: new Date(),
                                articles: []
                            };
                            const $ = cheerio.load(body);
                            const articleTitles = $('.article .galnetNewsArticleTitle a');
                            const articleText = $('.article > p');
            
                            for(let i = 0; i < articleTitles.length; i++) {
                                const title = articleTitles[i].children[1].data;
                                dataToSave.articles.push(title);
                                if (results[0] && results[0].articles && 
                                    results[0].articles.length > 0 && results[0].articles.includes(title)) {
                                    continue;
                                }
                                let desc = '';
                                for(let j = 0; j < articleText[i].children.length; j++) {
                                    const text = articleText[i].children[j];
                                    if (text && text.data) {
                                        desc += text.data + wrapLine;
                                    }
                                }
                                
                                let embed = new RichEmbed()
                                    .setColor(wingColor)
                                    .setTimestamp()
                                    .setTitle('**' + title + '**')
                                    .setDescription(desc)
                                    .setURL(fullUrl)
                                    .setThumbnail(thumb);
                                
                                if (bitly) {
                                    bitly.shorten('https://translate.google.com.br/?hl=pt-BR#en/pt/' + 
                                        textToTranslate(desc)).then((res) => {
                                        
                                        embed.setDescription(desc + 
                                            wrapLine +
                                            ':flag_br: [Clique aqui para traduzir](' + res.data.url + ')');
                
                                        channel.send({'embed': embed});
                                    }).catch((err) => {
                                        logger.error(logName + ' Error on shorten description: ', {'error': err});
                                        channel.send({'embed': embed});
                                    });
                                } else {
                                    channel.send({'embed': embed});
                                }
                                mongoConnection.saveOrUpdate(logName, dataToSave, 'notify', () => {});
                            }
                        });
                    }
                });
            }
        });

        //--- Methods ---
        const getDate = () => {
            const date = new Date();
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
            ];
            const year = date.getFullYear() + 1286;
            const day = utils.lpad(date.getDate(), 2, '0');
            return day + '-' + monthNames[date.getMonth()] + '-' + year;
        }
        const textToTranslate = (desc) => {
            return desc.replace(/\n/g, '%0A')
                .replace(/(?:\r\n|\r|\n)/g, '')
                .replace(/"/g, '%22')
                .replace(/‘/g, '%E2%80%98')
                .replace(/’/g, '%E2%80%99')
                .replace(/“/g, '%E2%80%9C')
                .replace(/”/g, '%E2%80%9D');
        }
    }
};

module.exports = exports;