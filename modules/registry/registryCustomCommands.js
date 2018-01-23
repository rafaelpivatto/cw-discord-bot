const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[GetCustomCommands] ';

exports.execute = function(client) {
    logger.info(logName + ' start get custom commands to register');
    
    const keyf = function(doc) {
        var date = new Date(doc.date);
        date.setTime( date.getTime() - (3600000*2));
        var dateKey = date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear()+'';
        return {'day':dateKey};
    };
    mongoConnection.findGroup(logName, keyf, {}, {count: 0}, 'userJoin', function(error, data) {
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
        }
        if (data.length && data.length > 0) {
            console.log(data);
        }
    });

    //List of custom commands by type
    mongoConnection.findGroup(logName, ['type'], {}, {}, 'customCommandsV2', function(error, data) {
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
        }
        if (data.length && data.length > 0) {
            const aliases = [];
            for(let item of data) {
                aliases.push(item.type);
            }
            client.registry.commands.get('@listcustom').aliases = aliases;
            logger.info(logName + ' Success to register group custom commands');
        }
    });

    //All custom commands
    mongoConnection.find(logName, {}, 'customCommandsV2', function(error, data) {
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