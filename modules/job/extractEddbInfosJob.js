const schedule = require('node-schedule');
const logger = require('heroku-logger')

const searchWingInfosFromEddb = require('../gateway/searchWingInfosFromEddb.js');
const normalizeWingInfoFromEddb = require('../service/normalizeWingInfoFromEddb.js');
const mongoConnection = require('../connection/mongoConnection.js');
const utils = require('../utils.js');

const logName = '[ExtractEddbInfosJob]';

exports.execute = () => {

    if (utils.isProdEnvironment()) {
        logger.info(logName + ' registering...');

        //Execute every hour
        schedule.scheduleJob('0 * * * *', () => {
            logger.info(logName + ' started...');
            
            searchWingInfosFromEddb.get(logName, (error, body) => {
                if (!error) {
                    const data = normalizeWingInfoFromEddb.getInfos(logName, body);
                    mongoConnection.saveOrUpdate(logName, data, 'wingData', (error) => {
                        logger.info(logName + ' Job ended...');
                    });
                }
            });
        });
    }
};

module.exports = exports;