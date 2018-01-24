const schedule = require('node-schedule');
const logger = require('heroku-logger');

const logName = '[ClearChannelsJob]';

exports.execute = function(client) {
    //Execute every one minute
    schedule.scheduleJob('0 */6 * * *', function(){

        logger.info(logName + ' was started...');

        const guild = client.guilds.find('id', process.env.GUILD_ID);

        if (!guild) return;

        if (process.env.CHANNELS_TO_CLEAR){
            const channels = process.env.CHANNELS_TO_CLEAR.split('|');
            for(let c of channels) {
                const channel = guild.channels.find('name', c);
                
                if (channel && channel.type === 'text') {
                    //console.log('teste', channel);
                    channel.fetchMessages().then(messages => {
                        messages.delete(messages.lastKey())
                        logger.info(logName + ' clear messages from channel: ' + c);
                        channel.bulkDelete(messages);
                        channel.send('Limpando as mensagens da sala...').then(msg => {
                            msg.delete(5000);
                        }).catch(console.error);
                    }).catch(console.error);
                }
            }
            
        }
        
    });
};

module.exports = exports;
