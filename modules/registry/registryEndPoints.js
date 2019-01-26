const logger = require('heroku-logger');
const express = require('express');
const request = require('request');

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
    
    app.use(express.static('src/assets'));

    app.all('/images/*', function (req, res) {
        fileManagement.loadFile(logName, res, req.path);
    });

    app.all('/', function (req, res) {
        res.sendFile(`${global.appRoot}/src/site/index/index.html`);
    });

    app.all('/login', function (req, res) {
        const clientId = process.env.CLIENT_ID;
        const urlCallback = process.env.LOGGED_IN_URL_CALLBACK;
        const scope = process.env.DISCORD_OAUTH_SCOPE;
        const discordUrl = `https://discordapp.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${urlCallback}&response_type=code&scope=${scope}`;
        res.redirect(discordUrl);
    });

    app.all('/loggedIn', function (req, res) {
        const options = {
            url: process.env.DISCORD_TOKEN_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'client_id': process.env.CLIENT_ID,
                'client_secret': process.env.CLIENT_SECRET,
                'grant_type': 'authorization_code',
                'code': req.query.code,
                'redirect_uri': process.env.LOGGED_IN_URL_CALLBACK,
                'scope': process.env.DISCORD_OAUTH_SCOPE
            }
        };

        request.post(options, (error, response, body) => {
            const bodyParsed = JSON.parse(body);
            const options = {
                url: `${process.env.DISCORD_API_URL}/users/@me`,
                headers: {
                    'Authorization': `Bearer ${bodyParsed.access_token}`
                }
            };
            request.get(options, (error, response, body) => {
                const bodyParsed = JSON.parse(body);
                res.send(`Bem-vindo ${bodyParsed.username}`);
            });            
        });
    });
};

module.exports = exports;