const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const errorMessage = require('../../modules/message/errorMessage.js');
const mongoConnection = require('../../modules/connection/mongoConnection.js');
const utils = require('../../modules/utils.js');

const wrapLine = '\n';
const wingThumb = 'http://i.imgur.com/ro5DQx9.png';
const wingColor = '#f00000';
const logName = '[LastNewUsersChart]';

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'novosusuarios',
            group: 'administration',
            memberName: 'novosusuarios',
            description: 'Command to generate chart for news users',
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        if (!msg.member.roles.find('name', process.env.RULE_ADMIN_BOT)) return;
        
        const keyf = function(doc) {
            var date = new Date(doc.date);
            date.setTime( date.getTime() - (3600000*2));
            var dateKey = date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear()+'';
            return {'day':dateKey};
        };

        const inicialDate = new Date();
        inicialDate.setUTCMonth(inicialDate.getUTCMonth() - 1);
        inicialDate.setUTCDate(inicialDate.getUTCDate() - 1);
        inicialDate.setUTCHours(0, 0, 0, 0);
        const condition = {_id : { '$gte' : inicialDate }};
        mongoConnection.findGroup(logName, keyf, condition, {count: 0}, 'userJoin', function(error, data) {
            if (error || !data) {
                logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
            }
            if (data.length && data.length > 0) {
                console.log(data);
            }
        });
    }
}    