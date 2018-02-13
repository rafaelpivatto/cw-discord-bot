const logger = require('heroku-logger');

const usersJoinAndLeft = require('../service/usersJoinAndLeft.js');

const logName = '[GenerateUsersGraph]';

exports.generate = (logPrefix, callback) => {

    logger.info(logPrefix + logName + ' Starting generate');

    usersJoinAndLeft.get(logName, (err, data) => {
        if (err) {
            logger.error(logName + ' Error on retrieving informations', {'error': error});
            callback('Houve um erro ao gerar o gráfico, tente novamente em breve, Fly safe, CMDR!');
        }
        if (!data || data.length === 0) {
            logger.error(logName + ' Error on retrieving informations', {'error': error});
            callback('Nenhum dado foi encontrado para gerar o gráfico.');
        }

        console.log(data);
    });

};