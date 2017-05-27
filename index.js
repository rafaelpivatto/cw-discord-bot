const Commando = require('discord.js-commando');
const bot = new Commando.Client();

/*bot.on('message', (message) => {
    if (message.content == 'ping') {
        message.reply('pong');
        //message.channel.sendMessage('pong');
    }
});*/

bot.registry.registerGroup('status', 'Status');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login('MzE3MzMxODE3MzE1NDM0NDk2.DAiR0Q.OZYF55hPkDzsn-iGrACADWaES_0');