const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');
const utils = require('../utils.js');

const logName = '[RegistryUserWelcome] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry discord events');

    if (!process.env.GUILD_ID || !process.env.ACCCEPTANCE_RULE || !process.env.USER_PRESENTATION_CHANNEL) return;

    const guild = client.guilds.find('id', process.env.GUILD_ID);
    if (!guild) return;
    
    client.on('guildMemberAdd', (member) => {
        setTimeout(() => {
            const data = {
                _id: new Date(),
                userName: member.nickname || member.user.username,
                userID: member.user.tag,
                date: new Date()
            };
            if (member.guild.id !== process.env.GUILD_ID){
                return;
            }
            mongoConnection.saveOrUpdate(logName, data, 'userJoin', () => {});
            const role = member.guild.roles.filter(x => x.name === process.env.ACCCEPTANCE_RULE).first();
            if (!role) {
                logger.error(logName + ' Role not found to apply => ' + process.env.ACCCEPTANCE_RULE);
            } else {
                member.addRole(role, 'added by bot.')
            }
            
            const channel = guild.channels.find('name', process.env.USER_PRESENTATION_CHANNEL);
            if (channel) {
                const rulesChannel = client.channels.find('name', process.env.RULES_CHANNEL);
                let rulesText = 'regras';
                if (rulesChannel) {
                    rulesText = '<#' + rulesChannel.id + '>';
                }
                return channel.send('<@' + member.user.id + '>, Bem-vindo a **Cobra Wing**, ' + 
                    'aqui é a sala onde a galera conversa sobre Elite Dangerous.\n' + 
                    'Nosso grupo privado no Elite é o **COBRA BR**' + 
                    ', se precisar de ajuda para entrar digite !grupoprivado\n' +
                    'Não esqueça de ler as ' + rulesText + ' e quaisquer dúvidas é ' +
                    'só perguntar ou digitar !cwajuda :wink:\n' +
                    'Fly safe, commander!');
            }
        }, 1000);        
    });

    client.on('guildMemberRemove', (member) => {
        setTimeout(() => {
            const data = {
                _id: new Date(),
                userName: member.nickname || member.user.username,
                userID: member.user.tag,
                date: new Date()
            };
            mongoConnection.saveOrUpdate(logName, data, 'userLeft', () => {});
        }, 1000);        
    })
};

module.exports = exports;