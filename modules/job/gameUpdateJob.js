const schedule = require('node-schedule');
const logger = require('heroku-logger');

exports.execute = function(client) {
    //Execute every one minute
    schedule.scheduleJob('*/1 * * * *', function(){
        const target = new Date('2017-09-26T10:00:00Z');
        const today = new Date();

        if (target > today) {
            const diffMs = (target - today); // milliseconds between now & target
            const diffDays = Math.floor(diffMs / 86400000); // days
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
            const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
            let msg = '2.4 em ';
            if (diffDays) {
                msg += diffDays + ' dias ';
            }
            msg += diffHrs + ' hrs ' + diffMins + ' min';
            client.user.setPresence({ game: { name: msg, type: 0 } });
        }
    });
};

module.exports = exports;