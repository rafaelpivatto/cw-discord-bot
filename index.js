const Commando = require('discord.js-commando');
const bot = new Commando.Client({
    unknownCommandResponse: false
});
const args = process.argv;

bot.registry.registerGroup('status', 'Status');
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(process.env.BOTKEY || args[3]);
console.log('Bot started');