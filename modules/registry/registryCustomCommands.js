const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[GetCustomCommands] ';

exports.execute = function(client) {
    logger.info(logName + ' start get custom commands to register');
    
    mongoConnection.find(logName, {}, 'customCommands', function(error, data) {
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
        }
        if (data.length && data.length > 0) {
            const aliases = [];
            for(let item of data) {
                aliases.push(item._id);
            }
            client.registry.commands.get('@general').aliases = aliases;
            logger.info(logName + ' Success to register custom commands');
        }
    });
};

module.exports = exports;