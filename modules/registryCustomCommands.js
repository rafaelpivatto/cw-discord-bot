const logger = require('heroku-logger');
const mongoConnection = require('./mongoConnection');

const logName = '[GetCustomCommands] ';

var exports = {};

exports.execute = function(client) {
    logger.info(logName + ' start get custom commands to register');
    
    mongoConnection.find(logName, {}, 'customCommands', function(error, data) {
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations', {'error': error});
        }
        if (data.length && data.length > 0) {
            const aliases = [];
            for(let item of data) {
                aliases.push(item._id);
            }
            client.registry.commands.get('@general').aliases = aliases;
        }
    });
};

module.exports = exports;