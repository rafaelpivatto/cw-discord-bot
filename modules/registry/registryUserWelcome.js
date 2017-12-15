const logger = require('heroku-logger');

const logName = '[RegistryUserWelcome] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry user welcome');
    
    client.on('guildMemberAdd', (member) => {
        setTimeout(() => {
            if (process.env.WELCOME_USER_MESSAGE === 'true' && process.env.GUILD_ID) {
                if (member.guild.id !== process.env.GUILD_ID){
                    return;
                }
                const role = member.guild.roles.filter(x => x.name === process.env.ACCCEPTANCE_RULE).first();
                if (!role) {
                    logger.error(logName + ' Role not found to apply => ' + process.env.ACCCEPTANCE_RULE);
                } else {
                    member.addRole(role, 'added by bot.')
                }
                
                const channel = client.channels.find('name', process.env.USER_PRESENTATION_CHANNEL);
                if (channel) {
                    const rulesChannel = client.channels.find('name', process.env.RULES_CHANNEL);
                    let rulesText = 'regras';
                    if (rulesChannel) {
                        rulesText = '<#' + rulesChannel.id + '>';
                    }
                    return channel.send('<@' + member.user.id + '>, Bem-vindo a **Cobra Wing**, ' + 
                        'aqui é a sala onde a galera conversa mais, seu acesso foi liberado e agora você ' + 
                        'tem acesso às salas.\n' + 
                        'Não esqueça de ler as ' + rulesText + ' e quaisquer dúvidas é ' +
                        'só perguntar ou digitar !cwajuda :wink:\n' +
                        'Fly safe, commander!');
                }
            }
        }, 1000);        
    });
};

module.exports = exports;