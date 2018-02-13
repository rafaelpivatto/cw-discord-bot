const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[UsersJoinAndLeft]';

exports.get = (logPrefix, callback) => {

    logger.info(logPrefix + logName + ' Starting get');

    const result = [];

    const keyf = function(doc) {
        var date = new Date(doc.date);
        date.setTime( date.getTime() - (3600000*2));
        var dateKey = date.getUTCDate()+"/"+(date.getUTCMonth()+1)+"/"+date.getUTCFullYear()+'';
        return {'day':dateKey};
    };

    const inicialDate = new Date();
    inicialDate.setUTCDate(inicialDate.getUTCDate() - 8);
    inicialDate.setUTCHours(0, 0, 0, 0);
    
    const condition = {_id : { '$gte' : inicialDate }};
    mongoConnection.findGroup(logName, keyf, condition, {count: 0}, 'userJoin', (error, data) => {
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
            callback(error, result);
        }
        if (data.length && data.length > 0) {
            for(let dA of data) {
                result.push({'date': dA.day, 'join': dA.count, 'left': 0});
            }
            mongoConnection.findGroup(logName, keyf, condition, {count: 0}, 'userLeft', (error, data) => {
                if (error || !data) {
                    logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
                    callback(error, result);
                }
                if (data.length && data.length > 0) {
                    for(let dB of data) {
                        for(let i=0; i < result.length; i++) {
                            if (dB.day === result[i].date) {
                                result[i].left = dB.count;
                                break;
                            }
                        }
                    }
                }
                callback(null, result);
            });
        } else {
            callback(null, result);
        }
    });
};