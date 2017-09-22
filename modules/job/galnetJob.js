const schedule = require('node-schedule');
const logger = require('heroku-logger');
const cheerio = require('cheerio');

const getFromUrl = require('../gateway/getFromUrl.js');

const logName = '[GalnetJob]';
const url = 'https://community.elitedangerous.com/en/galnet/21-SEP-3303';

exports.execute = function(client) {
    //Execute every half hour
    schedule.scheduleJob('24 * * * *', function(){
        logger.info(logName + ' started...');
        
        getFromUrl.getHtml(logName, url, function(error, body) {

            const $ = cheerio.load(body);
            const articleTitles = $('.article .galnetNewsArticleTitle a');
            const articleText = $('.article > p');

            for(let i = 0; i < articleTitles.length; i++) {
                console.log('Title: ' + articleTitles[i].children[1].data);

                for(let j = 0; j < articleText[i].children.length; j++) {
                    const text = articleText[i].children[j];
                    if (text && text.data) {
                        console.log(text.data);
                    }
                }

                console.log('\n\nFIM\n\n');
            }

        });
    });
};

module.exports = exports;