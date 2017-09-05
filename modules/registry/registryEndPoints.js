const logger = require('heroku-logger');
const express = require('express');

const fileManagement = require('../service/fileManagement.js');

const app = express();
const logName = '[RegistryEndPoints] ';

exports.execute = function() {
    logger.info(logName + ' start registry express endpoints');
    
    var server = app.listen(process.env.PORT || 5000, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.info('Server listening at ' + host + ':' + port);
    });
    
    app.all('/images/*', function (req, res) {
        fileManagement.loadFile(logName, res, req.path);
    });
    
    app.all('/', function (req, res) {
        res.status(200).send('Ok!');
    });
};

module.exports = exports;