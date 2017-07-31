var exports = {};

exports.sendClientErrorMessage = function(msg) {
    msg.channel.send('O bot tomou interdiction, aguarde um instante e tente ' +
        'novamente, fly safe CMDR!');
};

module.exports = exports;