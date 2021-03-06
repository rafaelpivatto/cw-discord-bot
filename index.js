require('dotenv').config();
require('discord.js');
// const Commando = require('discord.js-commando');
const logger = require('heroku-logger');

// const registryCustomCommands = require('./modules/registry/registryCustomCommands.js');
const registryJobsExecution = require('./modules/registry/registryJobsExecution.js');
const registryEndPoints = require('./modules/registry/registryEndPoints.js');
// const registryDiscordEvents = require('./modules/registry/registryDiscordEvents.js');
// const registryControllerToImageContest = require('./modules/registry/registryControllerToImageContest.js');

const logName = '[Index]';

// const client = new Commando.Client({
//     unknownCommandResponse: false,
// });

logger.info(logName + ' =========> Initializing bot');

// client.registry.registerGroup('administration');

// client.registry.registerGroup('customcommands');

// client.registry.registerGroup('help');

// client.registry.registerGroup('register');
// client.registry.registerGroup('status');
// client.registry.registerGroup('system');
// client.registry.registerCommandsIn(__dirname + '/commands');

// client.login(process.env.BOT_KEY);

// client.on('ready', (arg) => {
//     client.user.setPresence({ game: { name: '!ajuda', type: 0 } });
    
    // registryCustomCommands.execute(client);
    registryJobsExecution.execute();
    registryEndPoints.execute();
    // registryDiscordEvents.execute(client);
    // registryControllerToImageContest.execute(client);

    setTimeout(() => {
        logger.info(logName + ' =========> Bot started');
    }, 3000);
    
// });