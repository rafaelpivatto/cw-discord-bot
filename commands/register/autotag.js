const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const errorMessage = require('../../modules/message/errorMessage.js');

const logName = '[AutoTag]';
const wingColor = '#f00000';

const tags = [
    {
        name: 'X-ONE',
        aliases: ['x-one', 'xone', 'x-box', 'xbox'],
        description: 'Jogadores de Xbox One.',
    },
    {
        name: 'PS4',
        aliases: ['ps4', 'ps-4', 'playstation', 'play', 'play station'],
        description: 'Jogadores de PS4.',
    },
    {
        name: 'PC',
        aliases: ['pc', 'computador'],
        description: 'Jogadores de PC.',
        doubleWrapper: true,
    },
    {
        name: 'Fuel Rat',
        aliases: ['fuel rat', 'fuelrat', 'rato'],
        description: 'Quem deseja ajudar como Fuel Rat. (sujeito a moderação)',
    },
    {
        name: 'Orientador',
        aliases: ['orientador'],
        description: 'Quem deseja ajudar jogadores novatos. (sujeito a moderação)',
        doubleWrapper: true,
    },
    {
        description: '',
        name: 'Caçador Thargoid',
        aliases: ['cacador thargoid', 'cacador de thargoid', 'cacadorthargoid', 'caçador thargoid', 
                  'caçador de thargoid', 'caçadorthargoid', 'thargoid hunter', 'thargoidhunter', 'cacador targoid'],
        description: 'Se você é um legítimo caçador de thargoid',
    },
    {
        name: 'Explorador',
        aliases: ['explorador', 'explorer'],
        description: 'Se explorar é uma arte e a galáxia é pequena.',
    },
    {
        name: 'Minerador',
        aliases: ['minerador', 'mineirador', 'miner'],
        description: 'Se minerar é sua praia.',
    },
    {
        name: 'Comerciante',
        aliases: ['comerciante', 'comerciador', 'trader'],
        description: 'Comprar e vender para ser um grande comerciante.',
    },
    {
        name: 'Pirata',
        aliases: ['pirata', 'pirate'],
        description: 'se você é um pirata!? yarr!',
    },
    {
        name: 'Caçador Recompensas',
        aliases: ['cacador recompensas', 'cacador de recompensas', 'caçador recompensas', 'caçador de recompensas', 
                  'cacadorrecompensas', 'caçadorrecompensas', 'bounty hunter', 'bountyhunter'],
        description: 'Para um caçador de recompensas, quanto vale aquela cabeça?',
    },
    {
        name: 'Uber',
        aliases: ['uber', 'transportador', 'transporter'],
        description: 'Porque transportar passageiros é legal.',
        doubleWrapper: true,
    },
    {
        name: 'Império',
        aliases: ['imperio', 'empire'],
        description: 'Se você é aliado ao power play imperial.',
    },
    {
        name: 'Aliança',
        aliases: ['alianca', 'aliança', 'alliance', 'aliance'],
        description: 'Se você é aliado ao power play da aliança.',
    },
    {
        name: 'Federação',
        aliases: ['federaçao', 'federacao', 'federation'],
        description: 'Se você é aliado ao power play da federal.',
    },
    {
        name: 'Independente',
        aliases: ['independente', 'independent'],
        description: 'Se você é aliado ao power play independente.',
    },
];

module.exports = class AutotagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'autotag',
            group: 'register',
            memberName: 'autotag',
            description: 'add autotag to user',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        if (!AutotagCommand.checkRequirements(msg)) {
            return;
        }

        let description = '';
        let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle('Adicionar ou Remover tag:')
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setFooter('Fly safe cmdr!');

        if (!args || args === '') {
            
            description += 'Para **adicionar** ou **remover** uma tag ao seu perfil do discord, ' +
                'execute o comando !autotag seguido de umas das opções abaixo na sala <#309828038286114816>: \n\n';
            tags.forEach(tag => {
                description += `**${tag.name}** - *${tag.description}*\n`;
                if (tag.doubleWrapper) {
                    description += '\n';
                }
            });
            embed.setDescription(description);
            logger.info(`${logName} args not found!`);
            return msg.embed(embed);
        }

        const requestedTag = utils.removeDiacritics(args);
        const tagFound = tags.find(tag => tag.aliases.includes(String(requestedTag).toLowerCase()));
        const member = msg.member;
        const role = tagFound ? member.guild.roles.filter(role => role.name === tagFound.name).first() : undefined;
        
        if (role) {
            const userRoleFound = member.roles.filter(role => role.name === tagFound.name);
            const isAdd = userRoleFound && userRoleFound.size === 0;

            description += `Sua tag **${tagFound.name}** foi `;

            let promise;
            if(isAdd) {
                description += '__adicionada__!'
                logger.info(`${logName} role added! => ${role.name}`);
                promise = member.addRole(role, 'added by command !autotag');
            } else {
                description += '__removida__!'
                logger.info(`${logName} role removed! => ${role.name}`);
                promise = member.removeRole(role, 'removed by command !autotag');
            }

            promise
            .then(() => {
                description += '\n\n Se precisar adicionar ou remover outra tag, basta executar novamente o comando !autotag.'
                embed.setTitle('Sucesso!')
                embed.setDescription(description);
                return msg.embed(embed);
            })
            .catch((err) => {
                logger.error(`${logName} ERROR:`, err);
                AutotagCommand.errorMessage(msg, description, tagFound, role, embed);
            })          
        } else {
            AutotagCommand.errorMessage(msg, description, tagFound, role, embed);
        }
    }

    static errorMessage(msg, description, tagFound, role, embed) {
        description += 'A tag não pode ser adicionada, verifique o nome dela e tente novamente, ' + 
            'qualquer dúvida, chame algum moderador.';
        embed.setTitle('Ops! algo deu errado.')
        embed.setDescription(description);
        logger.error(`${logName} tagFound or role not found`, { 'tagFound': tagFound, 'role': role });
        return msg.embed(embed);
    }

    static isModeratorUser(msg) {
        if (process.env.RULE_MODERATOR) {
            return msg.member.roles.find('name', process.env.RULE_MODERATOR);
        }
        return false;
    }

    static checkRequirements(msg) {
        const textChannelAuthorized = process.env.MISCELLANEOUS_TEXT_CHANNEL;
        const userTextChannelCommand = msg.message.channel.name;

        if (AutotagCommand.isModeratorUser(msg)) {
            return true;
        }

        if (textChannelAuthorized !== userTextChannelCommand) {
            msg.delete();
            errorMessage.sendSpecificClientErrorMessage(msg, 
                'Por favor, execute esse comando na sala **<#' + 
                msg.client.channels.find('name', textChannelAuthorized).id + '>**', ' ');
            logger.info(logName + ' command executed out of channel');
            return false;
        }

        return true;
    }
};
