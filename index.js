require('dotenv').config()
const express = require('express');
const discord = require('discord.js');
const Commando = require('discord.js-commando');
const logger = require('heroku-logger')

var app = express();
const hourlyJob = require('./modules/hourlyJob.js');
const fileManagement = require('./modules/fileManagement.js');
const feedRead = require('./modules/feedRead.js');
const utils = require('./modules/utils.js');

const logName = '[Index]';

const bot = new Commando.Client({
    unknownCommandResponse: false,
});
const client = new discord.ClientUser();

logger.info(logName + ' Initializing bot');

bot.on('ready', (arg) => {
    bot.user.setGame('Elite: Dangerous');

    feedRead.readFeed(logName);
});

bot.registry.registerGroup('status', 'wingstatus');
bot.registry.registerGroup('status', 'winggraph');
bot.registry.registerGroup('status', 'ping');
bot.registry.registerGroup('status', 'systemfactionsgraph');
bot.registry.registerGroup('help', 'help');

bot.registry.registerCommandsIn(__dirname + '/commands')/

bot.login(process.env.BOT_KEY);

hourlyJob.execute();

logger.info(logName + ' Bot started');

var server = app.listen(process.env.PORT || 5000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});

app.all('/images/*', function (req, res) {
    fileManagement.loadFile(logName, res, req.path);
});

app.all('/', function (req, res) {
    res.status(200).send('Work!');
});