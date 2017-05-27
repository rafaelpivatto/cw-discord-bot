const Commando = require('discord.js-commando');
const bot = new Commando.Client();
const args = process.argv;

/*bot.on('message', (message) => {
    if (message.content == 'ping') {
        message.reply('pong');
        //message.channel.sendMessage('pong');
    }
});*/

bot.registry.registerGroup('status', 'Status');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(args[2]);