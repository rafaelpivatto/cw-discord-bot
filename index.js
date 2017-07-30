require('dotenv').config()
const discord = require('discord.js');
const Commando = require('discord.js-commando');
const utils = require("./modules/utils");
const bot = new Commando.Client({
    unknownCommandResponse: false,
});
const client = new discord.ClientUser();

bot.on('ready', (arg) => {
    bot.user.setGame("Elite: Dangerous");
});

bot.registry.registerGroup('status', 'Status');
bot.registry.registerGroup('graph', 'Graph');
bot.registry.registerGroup('ping', 'Ping');
bot.registry.registerCommandsIn(__dirname + '/commands')/
bot.login(process.env.BOT_KEY);

console.log('Bot started');