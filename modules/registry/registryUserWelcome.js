const logger = require('heroku-logger');

const logName = '[RegistryUserWelcome] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry user welcome');
    
    client.on('guildMemberAdd', (member) => {
        setTimeout(() => {
            if (process.env.WELCOME_USER_CHANNEL) {
                const channel = client.channels.find('name', process.env.WELCOME_USER_CHANNEL);
                const rulesChannel = client.channels.find('name', process.env.RULES_CHANNEL);
    
                let rulesText = 'regras';
                if (rulesChannel) {
                    rulesText = '<#' + rulesChannel.id + '>';
                }
                if (channel) {
                    channel.send('<@' + member.user.id + '>, Bem-vindo a recepção da Cobra Wing, ' + 
                        'após ler as ' + rulesText + ', digite **!aceito** para ser liberado em todas as salas.').then(message => {
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        }, 1000);        
    });
};

module.exports = exports;