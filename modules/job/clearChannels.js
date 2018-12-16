const schedule = require('node-schedule');
const logger = require('heroku-logger');

const utils = require('../utils.js');

const logName = '[ClearChannelsJob]';

exports.execute = (client) => {

    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every three hours
        schedule.scheduleJob('0 */12 * * *', () => {

            if (!process.env.GUILD_ID || !process.env.CHANNELS_TO_CLEAR) return;

            const guild = client.guilds.find(val => val.id === process.env.GUILD_ID);

            if (!guild) return;

            logger.info(logName + ' was started...');

            const channels = process.env.CHANNELS_TO_CLEAR.split('|');
            for(let c of channels) {
                const channel = guild.channels.find(val => val.name === c);
                
                if (channel && channel.type === 'text') {
                    //console.log('teste', channel);
                    channel.fetchMessages().then(messages => {
                        messages.delete(messages.lastKey())
                        logger.info(logName + ' clear messages from channel: ' + c);
                        channel.bulkDelete(messages);
                        channel.send('Limpando as mensagens da sala...').then(msg => {
                            msg.delete(20000);
                        }).catch(console.error);
                    }).catch(console.error);
                }
            }
            
        });
    }
};

module.exports = exports;
