const logger = require('heroku-logger')

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[LastSeenPlayers]';

exports.getAndUpdate = function(logPrefix, qtd, callback) {
    logger.info(logPrefix + logName + ' Starting get, qtd: ' + qtd);
    const query = {_id : 'USERS-PLAYING-ED' };
    mongoConnection.find(logPrefix + logName, query, 'statistics', function(error, resultFound){
        if (error) {
            logger.error(logPrefix + logName + ' Error on retrieving informations', {'error': error});
            callback(error);
        }

        if (!resultFound || resultFound.length === 0 || qtd > resultFound[0].qtd) {
            const dateSaved = {
                _id: 'USERS-PLAYING-ED',
                qtd: qtd,
                date: new Date()
            };
            logger.info(logPrefix + logName + ' Starting update, qtd: ' + qtd);
            mongoConnection.saveOrUpdate(logPrefix, dateSaved, 'statistics', function(error) {
                if (error) {
                    logger.error(logPrefix + logName + ' Error on save informations', {'error': error});
                    callback(error);
                }
                return callback(null, dateSaved);
            })
        } else {
            return callback(null, resultFound[0]);
        }
    });
};

module.exports = exports;