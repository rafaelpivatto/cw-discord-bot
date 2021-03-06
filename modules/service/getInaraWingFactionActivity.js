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
                loginremember: '1',
                formuniquecode: '1738084920'
            }
        };

        getFromUrl.do(logName, options, false, (err, data) => {
            callback(err, data);
        })
    };

    const doGetInfos = (callback) => {
        const url = 'https://inara.cz/squadron-faction-activity/163/';
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

    const _try = (func, fallbackValue = '#error#') => {
        try {
            const value = func();
            return (value === null || value === undefined) ? fallbackValue : value;
        } catch (e) {
            return fallbackValue;
        }
    }

    doLogin((err, data) => {
        if (err) callback(null);

        doGetInfos((err, html) => {
            if (err) callback(null);

            const $ = cheerio.load(JSON.stringify(html));
            const lines = $('table tbody tr');
            const divData = $("div")[82].children[1];
            const data = {
                commanders: [],
                members: _try(() => divData.children[49].data),
                ships: _try(() => divData.children[52].data),
                squadronAge: _try(() => divData.children[58].data),
                headQuarters: _try(() => divData.children[62].children[0].data),
                squadronName: _try(() => divData.children[66].children[0].data)
            };
            if (lines && lines.length > 0) {
                for(let i=0; i < lines.length; i++) {
                    let line = lines[i];
                    data.commanders.push({
                        name: _try(() => line.children[1].children[0].children[0].data),
                        influence: parseInt(_try(() => line.children[2].children[0].data), 0),
                        missions: _try(() => line.children[3].children[0].data),
                        percentOfMissions: _try(() => line.children[4].children[0].data)
                    });
                }
            }

            data.commanders.sort(sortFunction);

            callback(data);
        });
    });
};