require('dotenv').config()
const express = require('express');
const discord = require('discord.js');
const Commando = require('discord.js-commando');
const logger = require('heroku-logger')

var app = express();
const utils = require("./modules/utils");
const hourlyJob = require("./modules/hourlyJob.js");
const fileManagement = require("./modules/fileManagement.js");

const bot = new Commando.Client({
    unknownCommandResponse: false,
});
const client = new discord.ClientUser();

logger.info('Initializing bot');

bot.on('ready', (arg) => {
    bot.user.setGame("Elite: Dangerous");
});

bot.registry.registerGroup('status', 'wingstatus');
bot.registry.registerGroup('status', 'winggraph');
bot.registry.registerGroup('status', 'ping');
bot.registry.registerGroup('status', 'systemfactionsgraph');
bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(process.env.BOT_KEY);

hourlyJob.execute();

logger.info('Bot started');

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Mock listening at http://%s:%s', host, port);
});

app.all('/images/*', function (req, res) {
    fileManagement.loadFile(res, req.path);
});