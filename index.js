require('dotenv').config()
const Commando = require('discord.js-commando');
const bot = new Commando.Client({
    unknownCommandResponse: false
});

bot.registry.registerGroup('status', 'Status');
//bot.registry.registerGroup('graph', 'Graph');
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(process.env.BOT_KEY);
console.log('Bot started');