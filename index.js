const Commando = require('discord.js-commando');
const bot = new Commando.Client();
const args = process.argv;

bot.registry.registerGroup('status', 'Status');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(process.env.BOTKEY);