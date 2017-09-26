require('dotenv').config();
require('discord.js');
const Commando = require('discord.js-commando');
const logger = require('heroku-logger');

const registryCustomCommands = require('./modules/registry/registryCustomCommands.js');
const registryJobsExecution = require('./modules/registry/registryJobsExecution.js');
const registryEndPoints = require('./modules/registry/registryEndPoints.js');

const logName = '[Index]';

const client = new Commando.Client({
    unknownCommandResponse: false,
});

logger.info(logName + ' Initializing bot');

client.registry.registerGroup('status');
client.registry.registerGroup('help');
client.registry.registerGroup('customcommands');
client.registry.registerCommandsIn(__dirname + '/commands');

client.login(process.env.BOT_KEY);

client.on('ready', (arg) => {
    //client.user.setPresence({ game: { name: 'ajuda? !cwajuda', type: 0 } });
    client.user.setPresence({ game: { name: 'pegadinha do Malandro', type: 0 } });
    
    registryCustomCommands.execute(client);
    registryJobsExecution.execute(client);
    registryEndPoints.execute();

    logger.info(logName + ' Bot started');
});