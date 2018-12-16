const schedule = require('node-schedule');
const logger = require('heroku-logger')
const cheerio = require('cheerio');
const { RichEmbed } = require('discord.js');

const utils = require('../utils.js');
const getFromUrl = require('../gateway/getFromUrl.js');
const mongoConnection = require('../connection/mongoConnection.js');

const wingColor = '#f00000';
const logName = '[NewsletterJob]';
const baseUrl = 'https://forums.frontier.co.uk'
const url = `${baseUrl}/forumdisplay.php/73-Newsletters`;

exports.execute = (client) => {

    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every hour **:03 --> 3 * * * *
        schedule.scheduleJob('3 * * * *', () => {
            if (!process.env.NEWSLETTER_CHANNEL) {
                logger.warn(logPrefix + logName + ' not NEWSLETTER_CHANNEL configured.');
                return;
            }
            const guild = client.guilds.find(val => val.id === process.env.GUILD_ID);
            if (!guild) return;

            logger.info(logName + ' started...');

            const channel = guild.channels.find(val => val.name === process.env.NEWSLETTER_CHANNEL);
                    
            if (channel) {
                const query = {_id: 'NEWSLETTER'}
                mongoConnection.find(logName, query, 'notify', (error, results) => {
                    if (error) {
                        logger.error(logName + ' Error on retrieving informations', {'query': query, 'error': error});
                    }

                    if (results.length == 0 || results.length > 0) {

                        getFromUrl.getHtml(logName, url, (error, body) => {

                            if (error) return;

                            const $ = cheerio.load(body);
                            const titles = $('.title');

                            if (!titles || titles.length < 1) return;

                            const title = titles[0].children[0].data;
                            const link = `${baseUrl}/${titles[0].attribs.href}`;
                            if (results[0].title != title) {
                                const saveData = {
                                    _id: 'NEWSLETTER',
                                    updateDate: new Date(),
                                    title: title,
                                    link: link
                                };

                                mongoConnection.saveOrUpdate(logName, saveData, 'notify', function(error) {
                                    if (error) {
                                        logger.error(logName + ' Error to save data ', {'data': saveData, 'error': error});
                                    } else {
                                        let embed = new RichEmbed()
                                            .setTimestamp()
                                            .setTitle(':loudspeaker: Tem novidades na área pessoal! ' + title)
                                            .setThumbnail('http://i.imgur.com/Pt5WUvu.png')
                                            .setFooter('Fly safe cmdr!')
                                            .setColor(wingColor)
                                            .setDescription('Nova newsletter da frontier, para ver as novidades acesse o link abaixo:' + 
                                                '\n\n' + link);
                                        return channel.send('@here', {'embed': embed});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports = exports;