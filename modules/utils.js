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

module.exports = exports;