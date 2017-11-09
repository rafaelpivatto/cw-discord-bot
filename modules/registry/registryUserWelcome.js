const logger = require('heroku-logger');

const logName = '[RegistryUserWelcome] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry user welcome');
    
    client.on('guildMemberAdd', (member) => {
        setTimeout(() => {
            if (process.env.WELCOME_USER_CHANNEL) {
                const guild = client.guilds.filter(x => x.id === process.env.GUILD_ID).first();
                if (!guild) {
                    return;
                }
                const guildMember = guild.members.filter(x => x.id === member.user.id).first();
                if (!guildMember) {
                    return;
                }
                const channel = client.channels.find('name', process.env.WELCOME_USER_CHANNEL);
                const rulesChannel = client.channels.find('name', process.env.RULES_CHANNEL);
    
                let rulesText = 'regras';
                if (rulesChannel) {
                    rulesText = '<#' + rulesChannel.id + '>';
                }
                if (channel) {
                    const nickname = member.nickname || member.user.username;
                    logger.info(logName + ' Welcome message to new member: ' + nickname);
                    channel.send('<@' + member.user.id + '>, Bem-vindo à **COBRA WING**! Sua papelada parece estar em ordem, ' + 
                        'após ler as ' + rulesText + ', digite **!aceito** para ser liberado em todas as salas. ' + 
                        'Pode pegar suas malas e entrar.\n').then(message => {
                        message.delete(86400000);
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        }, 1000);        
    });
};

module.exports = exports;