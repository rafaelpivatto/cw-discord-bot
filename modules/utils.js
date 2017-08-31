var exports = {};

exports.lpad = function(text, width, z) {
    z = z || ' ';
    text = text + '';
    return text.length >= width ? text : new Array(width - text.length + 1).join(z) + text;
};

exports.rpad = function(text, width, z) {
    z = z || ' ';
    text = text + '';
    return text.length >= width ? text : text + new Array(width - text.length + 1).join(z);
};

exports.getUTCDate = function(date) {
    const utc_timestamp = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(), date.getUTCDate() , 
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());

    return new Date(utc_timestamp);
};

exports.getUTCDateNow = function() {
    return exports.getUTCDate(new Date());
};

exports.getBRTDate = function(date) {
    const utc = exports.getUTCDate(date);
    return new Date(utc.valueOf() + utc.getTimezoneOffset() * -60000)
};

exports.getBRTDateNow = function(date) {
    return exports.getBRTDate(new Date());
};

exports.removeSpaces = function(str) {
    var re = new RegExp(' ', 'g');
    return String(str).replace(re, '');
};

module.exports = exports;