const schedule = require('node-schedule');
const logger = require('heroku-logger');

exports.execute = (client) => {
    //Execute every one minute
    schedule.scheduleJob('*/1 * * * *', () => {
        const target = new Date('2018-01-25T12:00:00Z');
        const today = new Date();

        if (target > today) {
            const diffMs = (target - today); // milliseconds between now & target
            const diffDays = Math.floor(diffMs / 86400000); // days
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
            const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
            let msg = '2.5 em ';
            if (diffDays) {
                msg += diffDays + ' dias ';
            }
            msg += diffHrs + ' hrs ' + diffMins + ' min';
            client.user.setPresence({ game: { name: msg, type: 0 } });
        } else {
            client.user.setPresence({ game: { name: '2.5 is alive!?', type: 0 } });
        }
    });
};

module.exports = exports;
