const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[UsersJoinAndLeft]';

exports.get = (logPrefix, callback) => {

    logger.info(logPrefix + logName + ' Starting get');

    const result = [];

    const keyf = function(doc) {
        var date = new Date(doc.date);
        date.setTime( date.getTime() - (3600000*2));
        var dateKey = '0' + date.getUTCDate() + '/' + '0' + (date.getUTCMonth()+1);
        return {'day':dateKey};
    };

    const inicialDate = new Date();
    inicialDate.setUTCMonth(inicialDate.getUTCMonth() - 1);
    inicialDate.setUTCHours(0, 0, 0, 0);
    
    const condition = {_id : { '$gte' : inicialDate }};
    mongoConnection.findGroup(logName, keyf, condition, {count: 0}, 'userJoin', (error, dataResult) => {
        const data = dataResult.slice(dataResult.length-10, dataResult.length)
        if (error || !data) {
            logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
            callback(error, result);
        }
        if (data.length && data.length > 0) {
            for(let dA of data) {
                result.push({'date': format(dA.day), 'join': dA.count, 'left': 0});
            }
            mongoConnection.findGroup(logName, keyf, condition, {count: 0}, 'userLeft', (error, data) => {
                if (error || !data) {
                    logger.error(logName + ' Error on retrieving informations and register custom commands', {'error': error});
                    callback(error, result);
                }
                if (data.length && data.length > 0) {
                    for(let dB of data) {
                        for(let i=0; i < result.length; i++) {
                            if (format(dB.day) === result[i].date) {
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

    const format = (date) => {
        const pieces = date.split('/');
        const f = pieces[0];
        const s = pieces[1];
        return f.substring(f.length-2, f.length) + '/' + s.substring(s.length-2, s.length);
    };
};