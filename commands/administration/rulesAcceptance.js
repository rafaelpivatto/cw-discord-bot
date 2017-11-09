const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');

const logName = '[RulesAcceptance]';
const wingColor = '#f00000';

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'aceito',
            group: 'administration',
            memberName: 'rulesacceptance',
            description: 'commando to rules acceptance',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Execute rules acceptance by user = ' + msg.message.author.username);
        
        if (msg.message.channel.name !== process.env.WELCOME_USER_CHANNEL) {
            return;
        }

        const guild = msg.client.guilds.filter(x => x.id === process.env.GUILD_ID).first();

        if (!guild) {
            logger.error(logName + ' Guild by id not found');
            return msg.send('Houve um erro, por favor, aguarde até um @Major liberar seu acesso.');
        }

        const role = guild.roles.filter(x => x.name === process.env.ACCCEPTANCE_RULE).first();

        if (!role) {
            logger.error(logName + ' Role not found to apply');
            return msg.send('Houve um erro, por favor, aguarde até um @Major liberar seu acesso.');
        }

        //apply role
        msg.message.member.addRole(role, 'added by rules acceptance.').then(member => {
            logger.info(logName + ' Adding role to member');
            //delete user messages
            msg.message.delete();
            msg.message.channel.fetchMessages().then(messages => {
                const messagesToDelete = [];
                for(let message of messages) {
                    if (message[1].author.id === msg.author.id) {
                        messagesToDelete.push(message[1]);
                    }
                    if (message[1].content.indexOf(member.user.id) > -1) {
                        messagesToDelete.push(message[1]);
                    }
                }
                msg.message.channel.bulkDelete(messagesToDelete);
            });
        
            const channel = msg.client.channels.find('name', process.env.USER_PRESENTATION_CHANNEL);
    
            if (channel) {
                return channel.send('<@' + member.user.id + '>, Bem-vindo a **Cobra Wing**, ' + 
                    'aqui é a sala onde a galera conversa mais, seu acesso foi liberado e agora você ' + 
                    'tem acesso às salas, quaisquer dúvidas é só perguntar :wink:\n' +
                    'Fly safe, commander!');
            }
        }).catch(error => {
            logger.error(logName + ' Error to apply role on user', error);
            return msg.send('Houve um erro, por favor, aguarde até um @Major liberar seu acesso.');
        });
    }
}    