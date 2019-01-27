const logger = require('heroku-logger');

const fileManagement = require('../service/fileManagement.js');

const logName = '[registryBotEndPoints] ';

exports.execute = (app) => {
    logger.info(logName + ' start registry express endpoints');
    
    //endpoints
    app.get('/images/*', function (req, res) {
        fileManagement.loadFile(logName, res, req.path);
    });
};

module.exports = exports;