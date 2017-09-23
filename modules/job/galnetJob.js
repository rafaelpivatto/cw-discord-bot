const schedule = require('node-schedule');
const logger = require('heroku-logger');
const cheerio = require('cheerio');
const { RichEmbed } = require('discord.js');
const googl = require('goo.gl');

const getFromUrl = require('../gateway/getFromUrl.js');
const wingColor = '#f00000';
const wrapLine = '\n';
const thumb = 'https://i.imgur.com/Ig6OgUj.png';

const logName = '[GalnetJob]';
const url = 'https://community.elitedangerous.com/en/galnet/21-SEP-3303';

exports.execute = function(client) {
    googl.setKey(process.env.GOOGL_KEY);
    //Execute every half hour
    schedule.scheduleJob('09 * * * *', function(){
        logger.info(logName + ' started...');
        const channel = client.channels.find('name', process.env.GALNET_INFO_CHANNEL);
        
        if (channel) {
            getFromUrl.getHtml(logName, url, function(error, body) {

                const $ = cheerio.load(body);
                const articleTitles = $('.article .galnetNewsArticleTitle a');
                const articleText = $('.article > p');

                for(let i = 0; i < articleTitles.length; i++) {
                    const title = articleTitles[i].children[1].data;
                    let desc = '';
                    for(let j = 0; j < articleText[i].children.length; j++) {
                        const text = articleText[i].children[j];
                        if (text && text.data) {
                            desc += text.data + wrapLine;
                        }
                    }
                    
                    googl.shorten('https://translate.google.com.br/?hl=pt-BR#en/pt/' + desc)
                    .then(function (shortUrl) {
                        let embed = new RichEmbed()
                            .setColor(wingColor)
                            .setTimestamp()
                            .setTitle('**' + title + '**')
                            .setDescription(desc + 
                                            wrapLine + 
                                            '[Clique aqui para traduzir](' + shortUrl + ')')
                            .setURL(url)
                            .setThumbnail(thumb);

                        channel.send('', {'embed': embed});
                    });
                }

            });
        }
    });
};

module.exports = exports;