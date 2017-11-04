const { RichEmbed } = require('discord.js');

const utils = require('../utils.js');

exports.sendClientErrorMessage = function(msg) {
    msg.channel.send({'embed': new RichEmbed()
        .setColor('#f00000')
        .setTimestamp()
        .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
        .setDescription('O bot tomou interdiction, aguarde um instante e tente ' +
            'novamente, fly safe CMDR!')});
};

exports.sendSpecificClientErrorMessage = function(msg, errorMessage) {
    msg.channel.send({'embed': new RichEmbed()
        .setColor('#f00000')
        .setTimestamp()
        .setThumbnail('https://i.imgur.com/JYY3pCv.png')
        .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
        .setDescription(errorMessage)});
};

module.exports = exports;