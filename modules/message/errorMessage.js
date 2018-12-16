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

exports.sendSpecificClientErrorMessage = function(
    msg, 
    errorMessage, 
    thumbnail = 'https://i.imgur.com/JYY3pCv.png', 
    image = '') {
    const embed = new RichEmbed()
        .setColor('#f00000')
        .setTimestamp()
        .setThumbnail(thumbnail)
        .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
        .setDescription(errorMessage);
    
    if (image) {
        embed.setImage(image);
    }

    msg.channel.send({'embed': embed});
};

module.exports = exports;