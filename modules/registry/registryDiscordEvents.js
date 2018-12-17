const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');
const utils = require('../utils.js');

const logName = '[RegistryUserWelcome] ';

exports.execute = function(client) {
    logger.info(logName + ' start registry discord events');

    if (!process.env.GUILD_ID || !process.env.ACCCEPTANCE_RULE || !process.env.USER_PRESENTATION_CHANNEL) return;

    const guild = client.guilds.find(val => val.id === process.env.GUILD_ID);
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
            const role = member.guild.roles.filter(role => role.name === process.env.ACCCEPTANCE_RULE).first();
            if (!role) {
                logger.error(logName + ' Role not found to apply => ' + process.env.ACCCEPTANCE_RULE);
            } else {
                member.addRole(role, 'added by bot when member joined.')
            }
            
            const channel = guild.channels.find(val => val.name === process.env.USER_PRESENTATION_CHANNEL);
            if (channel) {
                const rulesChannel = client.channels.find(val => val.name === process.env.RULES_CHANNEL);
                const rulesText = rulesChannel ? `<#${rulesChannel.id}>` : 'regras';
                return channel.send('Olá <@' + member.user.id + '>, seja bem-vindo(a) a **Cobra Wing**.\n' + 
                    'No Elite, nosso grupo privado é: **COBRA BR** e nosso esquadrão: **COBRA WING**.\n' + 
                    'Se precisar de ajuda para entrar digite !grupoprivado\n' +
                    'Nosso grupo no Inara: <https://inara.cz/wing/163>\n'+
                    'Não esqueça de ler as ' + rulesText + ' e quaisquer dúvidas é ' +
                    'só perguntar ou digitar !ajuda :wink:\n' +
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