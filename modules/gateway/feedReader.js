const feedparser = require('feedparser-promised');
const logger = require('heroku-logger');
const discord = require('discord.js');

const mongoConnection = require('../connection/mongoConnection.js');

const wingColorEmbed = '#f00000';
const url = 'https://forums.frontier.co.uk/external.php?type=RSS2&forumids=73';
const logName = '[FeedReader] ';

exports.readFeed = function(logPrefix, client) {
    logger.info(logPrefix + logName + ' start read feed url=' + url);

    if (!process.env.NEWSLETTER_CHANNEL) {
        logger.warn(logPrefix + logName + ' not NEWSLETTER_CHANNEL configured.');
        return;
    }
    feedparser.parse(url).then( (items) => {
        logger.info(logPrefix + logName + ' feed readed.');
        
        items.forEach(item => {
            logger.info(logPrefix + logName + ' Item: ' + item.title);
                
            const query = {_id : 'NEWSLETTER' };
            mongoConnection.find(logPrefix, query, 'notify', function(error, results) {
                if (error) {
                    logger.error(logName + ' Error on retrieving informations', {'query': query, 'error': error});
                }

                if (results.length == 0 || (results.length > 0 && results[0].updateDate < item.date)) {
                    
                    const saveData = {
                        _id: 'NEWSLETTER',
                        updateDate: item.date,
                        title: item.title,
                        link: item.guid
                    };

                    mongoConnection.saveOrUpdate(logPrefix, saveData, 'notify', function(error) {
                        if (error) {
                            logger.error(logName + ' Error to save data ', {'data': saveData, 'error': error});
                        } else {
                            logger.info(logName + ' Data saved', {'data': saveData});
                            let channel = client.channels.find('name', process.env.NEWSLETTER_CHANNEL);
                            let embed = new discord.RichEmbed()
                                .setTimestamp()
                                .setTitle(':loudspeaker: Tem novidades na área pessoal! ' + item.title)
                                .setThumbnail('http://i.imgur.com/Pt5WUvu.png')
                                .setFooter('Fly safe cmdr!')
                                .setColor(wingColorEmbed)
                                .setDescription('Nova newsletter da frontier, para ver as novidades acesse o link abaixo:' + 
                                    '\n\n' + item.guid);
                            if (channel) {
                                return channel.send('@here', {'embed': embed});
                            }
                        }
                    });
                } else {
                    logger.info(logPrefix + logName + ' Item skipped ' + item.title);
                }
            });

        });
    }).catch(error => logger.error('Error to read feed ', {'error': error}));    
};

module.exports = exports;