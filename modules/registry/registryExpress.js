const logger = require('heroku-logger');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const logName = '[registryExpress] ';

exports.execute = (callback) => {
    logger.info(logName + ' start registry express endpoints');
    
    const server = app.listen(process.env.PORT || 5000, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.info('Server listening at ' + host + ':' + port);
    });
    
    //middlewares
    app.use(express.static('src/assets'));

    // initialize body-parser to parse incoming parameters requests to req.body
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // initialize cookie-parser to allow us access the cookies stored in the browser. 
    app.use(cookieParser());

    callback(app);
};

module.exports = exports;