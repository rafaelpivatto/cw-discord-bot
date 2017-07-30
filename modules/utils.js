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
    var utc_timestamp = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(), date.getUTCDate() , 
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());

    return new Date(utc_timestamp);
};

exports.getBRTDate = function(date) {
    var utc = exports.getUTCDate(new Date());
    return new Date(utc.valueOf() + utc.getTimezoneOffset() * -60000)
};



module.exports = exports;