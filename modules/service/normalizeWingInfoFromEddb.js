const cheerio = require('cheerio');
const logger = require('heroku-logger')

const logName = '[NormalizeWingInfoFromEddb] ';

var exports = {};

exports.getInfos = function(logPrefix, body) {
    logger.info(logPrefix + logName + ' Init method');
    const $ = cheerio.load(body);
    let data = {};
    data._id = new Date();
    data._id.setUTCHours(0,0,0,0);
    data.lastUpdate = new Date();
    data.wingName = getWingName($);
    data.infos = [];

    const systems = $('.systemRow strong a');
    const tableInfo = $('.systemRow .semi-strong');
    let idxControlledSystem = 0;
    let tablePosition = 0;
    let tableStatePosition = 3;

    if (systems && systems.length > 0 && tableInfo && tableInfo.length > 0) {
        for(let i=0; i < systems.length; i++) {
            const info = {};
            info.systemName = systems[i].children[0].data;
            info.controlledSystem = false;
            info.influence = getInfluence($, i);
            info.state = $('.systemFactionRow.isHighlighted .semi-strong')[tableStatePosition].children[0].data;
            info.security = tableInfo[tablePosition++].children[0].data;    
            info.eddbUpdate = getUpdateEddbTime($, i);
            if (isSystemControlled($, ++idxControlledSystem)) {
                idxControlledSystem++;
                info.controlledSystem = true;
            }
            data.infos[i] = info;
            tablePosition += 4;
            tableStatePosition += 4;
        }
    }

    logger.info(logPrefix + logName + ' Finish method');
    return data;
};

function getWingName($) {
    if ($('h1')[0] && 
        $('h1')[0].children &&
        $('h1')[0].children.length >= 2  && 
        $('h1')[0].children[2].data) {
        
        return $('h1')[0].children[2].data.trim();
    } else {
        return null;
    }
}

function isSystemControlled($, idxControlledSystem) {
    const obj = $('.systemRow strong a, .systemFactionRow.isHighlighted .systemPresenceTag .fa-flip-vertical')[idxControlledSystem];
    return obj && obj.name && obj.name === 'i';
}

function getInfluence($, i) {
    let influence = $('.systemFactionRow.isHighlighted .factionInfluence .semi-strong')[i].children[0].data;
    return Number(influence.replace('%', ''));
}

function getUpdateEddbTime($, i) {
    const updateTimeFull = $('.systemRow td')[i].lastChild.data.trim();
    return updateTimeFull.split(': ')[1];
}

module.exports = exports;