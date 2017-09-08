const schedule = require('node-schedule');
const logger = require('heroku-logger')

const dateFormat = require('dateformat');
const getServerStatusFromEdsm = require('../service/getServerStatusFromEdsm.js');
const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[CheckServerStatusJob]';
const doubleWrapLine = '\n\n';
const wingColor = '#f00000';

exports.execute = function() {
    //Execute every half hour
    schedule.scheduleJob('*/30 * * * *', function(){
        logger.info(logName + ' started...');
        
        getServerStatusFromEdsm.getServerStatus(logName, function(error, currentServerStatus) {
            if (!error && currentServerStatus && currentServerStatus.length > 0) {
                const query = {_id: 'SERVER_STATUS'};
                mongoConnection.find(logName, query, 'notify', function(error, lastNotify) {

                    if (lastNotify.status !== currentServerStatus.status &&
                        getDate(lastNotify.lastUpdate) > getDate(currentServerStatus.lastUpdate)) {
                        
                        let channel = bot.channels.find('name', process.env.SERVER_STATUS_CHANNEL);
                        if (channel) {
                            //save

                            //notify
                            const infos = getByStatus(lastNotify.status, currentServerStatus);
                            let embed = new RichEmbed()
                                .setColor(wingColor)
                                .setTimestamp()
                                .setTitle('Status Elite: Dangerous')
                                .setThumbnail(infos.thumb)
                                .setFooter('Fly safe cmdr!')
                                .setDescription(infos.message);
                                
                            return channel.send(infos.notify, {'embed': embed});
                        }
                    }
                });
            }
        });
    });

    //--- Methods ---
    function getDate(strDate) {
        return dateFormat(strDate, 'yyyy-mm-dd HH:MM:ss')
    }

    function getByStatus(fromStatus, currentServerStatus) {
        let obj = {};
        const defaultMessage = '\n__Data da última atualização:__ ' +
                            getDate(currentServerStatus.lastUpdate) + ' UTC' +
                            doubleWrapLine +
                            '*OBS.: Consulta realizada através do EDSM, ' +
                            'poderão ocorrer equivocos devido a falha de comunicação com o servidor.*';

        switch(currentServerStatus.status) {
            case 2:
                obj.notify = fromStatus == 0 ? '@everyone' : '';
                obj.message = '**ATENÇÃO:** Ao que tudo indica, o servidor do Elite:Dangerous voltou ao normal ' +
                                'e está __ONLINE__ novamente.' +
                                defaultMessage;
                obj.thumb = 'http://i.imgur.com/GD5yfU3.png';
                return obj
                break;

            case 1:
                obj.message = '**ATENÇÃO:** O servidor do Elite:Dangerous está sofrendo __instabilidades__!**' +
                                doubleWrapLine +
                                'Fique atento, você poderá sofrer desconexões...' +
                                defaultMessage;
                obj.thumb = 'http://i.imgur.com/wBA85oa.png';
                return obj    
                break;

            case 0:
                obj.notify = fromStatus == 2 ? '@everyone': '';
                obj.message = '**ATENÇÃO:** O servidor do Elite:Dangerous aparenta estar __OFFLINE__!!!' + 
                                doubleWrapLine +
                                '__Possíveis causas:__' + 
                                doubleWrapLine +
                                '- Manutenção dos servidores;\n' +
                                '- Atualização do jogo;\n' +
                                '- Ataques Thargoid :alien:.\n' +
                                defaultMessage;
                obj.thumb = 'http://i.imgur.com/mQ2aFdk.png';
                return obj    
                break;
        }
    }
};

module.exports = exports;