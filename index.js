require('dotenv').config()
const express = require('express');
const discord = require('discord.js');
const Commando = require('discord.js-commando');
const logger = require('heroku-logger')

var app = express();
const hourlyJob = require('./modules/hourlyJob.js');
const fileManagement = require('./modules/fileManagement.js');
const halfHourlyJob = require('./modules/halfHourlyJob.js');
const registryCustomCommands = require('./modules/registryCustomCommands.js');

const logName = '[Index]';

const client = new Commando.Client({
    unknownCommandResponse: false,
});

logger.info(logName + ' Initializing bot');

client.registry.registerGroup('status');
client.registry.registerGroup('help');
client.registry.registerGroup('customcommands');

client.registry.registerCommandsIn(__dirname + '/commands')/

client.login(process.env.BOT_KEY);

client.on('ready', (arg) => {
    client.user.setPresence({ game: { name: 'ajuda? !cwajuda', type: 0 } });
    
    registryCustomCommands.execute(client);
    hourlyJob.execute();
    halfHourlyJob.execute(client);    
});

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