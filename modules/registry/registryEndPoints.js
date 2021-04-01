const logger = require('heroku-logger');
const express = require('express');
const path = require('path');

// const fileManagement = require('../service/fileManagement.js');
// const getMembersFromService = require('../service/getMembersFromServer.js');

const app = express();
const logName = '[RegistryEndPoints] ';

let client;

exports.execute = function() {
    logger.info(logName + ' start registry express endpoints');
    // client = clientDiscord;

    var server = app.listen(process.env.PORT || 5000, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.info('Server listening at ' + host + ':' + port);
    });
    
    // app.all('/images/*', function (req, res) {
    //     fileManagement.loadFile(logName, res, req.path);
    // });

    // app.get('/members', function(req, res) {
    //     getMembersFromService.execute(client).then(fileName => {
    //         const filePath = path.join(__dirname, '..', '..', fileName);
    //         res.status(200).sendFile(filePath);
    //     }).catch(err => {
    //         res.status(400).send(`Erro ao baixar lista: ${err}`);
    //     });
    // });
    
    app.all('/', function (req, res) {
        res.status(200).send('Ok!');
    });
};

module.exports = exports;