const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const utils = require('../../modules/utils.js');
const generateUsersGraph = require('../../modules/service/generateUsersGraph.js');
const errorMessage = require('../../modules/message/errorMessage.js');

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
        
        generateUsersGraph.generate(logName, (err, img) => {
            if (err) {
                return errorMessage.sendSpecificClientErrorMessage(msg, err);
            }
        });
    }
}    