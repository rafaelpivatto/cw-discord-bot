const logger = require('heroku-logger');
const cheerio = require('cheerio');

const getFromUrl = require('../gateway/getFromUrl.js');

const logName = '[getInaraWingFactionActivity]';

exports.getFactionActivity = (logPrefix, callback) => {

    logger.info(`${logPrefix} ${logName} Starting get faction activity`);

    const doLogin = (callback) => {
        const options = {
            method: 'POST',
            url: 'https://inara.cz/intro/',
            formData: {
                location: 'intro',
                formact: 'USER_LOGIN',
                loginid: process.env.INARA_LOGIN,
                loginpass: process.env.INARA_PASS,
                loginremember: '1'
            }
        };

        getFromUrl.do(logName, options, false, (err, data) => {
            callback(err, data);
        })
    };

    const doGetInfos = (callback) => {
        const url = 'https://inara.cz/wing-faction-activity/163/';
        getFromUrl.getHtml(logName, url, (err, data) => {
            callback(err, data);
        });
    };

    const sortFunction = (a, b) => {
        if (a.influence === b.influence) {
            return 0;
        } else {
            return (a.influence > b.influence) ? -1 : 1;
        }
    }

    doLogin((err, data) => {
        if (err) callback(null);

        doGetInfos((err, html) => {
            if (err) callback(null);

            const $ = cheerio.load(JSON.stringify(html));
            const lines = $('table tbody tr');
            const data = {
                commanders: [],
                members: $("div")[81].children[1].children[27].data,
                ships: $("div")[81].children[1].children[30].data,
                headQuarters: $("div")[81].children[1].children[37].children[0].data,
                wingName: $("div")[81].children[1].children[41].children[0].data
            };
            if (lines && lines.length > 0) {
                for(let i=0; i < lines.length; i++) {
                    let line = lines[i];
                    data.commanders.push({
                        name: line.children[1].children[0].children[0].data,
                        influence: line.children[2].children[0].data,
                        missions: line.children[3].children[0].data,
                        percentOfMissions: line.children[4].children[0].data
                    });
                }
            }

            data.commanders.sort(sortFunction);

            callback(data);
        });
    });
};