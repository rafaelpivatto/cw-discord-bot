const logger = require('heroku-logger');
const { RichEmbed } = require('discord.js');
const imgur = require('imgur');

const utils = require('../utils.js');
const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[registryControllerToImageContest] ',
    wingColor = '#f00000',
    albumId = 'kIPZI';

exports.execute = function(client) {
    if (!process.env.IMAGE_CONTEST_CHANNEL) return;

    logger.info(logName + ' start registry controller to image contest');
    
    const channels = process.env.IMAGE_CONTEST_CHANNEL.split('|');
    if (process.env.IMGUR_CREDENTIALS) {
        const credentials = process.env.IMGUR_CREDENTIALS.split('|');
        imgur.setCredentials(credentials[0], credentials[1], credentials[2]);
        imgur.setAPIUrl('https://api.imgur.com/3/')
    }
    
    client.on('message', (message) => {
        //Discards messages from other channels
        if (!channels.includes(message.channel.name)) {
            return;
        }

        const embed = new RichEmbed()
            .setColor(wingColor)
            .setAuthor(utils.getUserNickName(message), utils.getUserAvatar(message))
            .setFooter('Essa mensagem se destruirá em 30 segundos...')
            .setImage('https://i.imgur.com/dJ0o6TK.png');

        //Discard message with content and notify 
        if (message.content !== '') {
            message.delete();
            const embed = new RichEmbed()
                .setColor(wingColor)
                .setAuthor(utils.getUserNickName(message), utils.getUserAvatar(message))
                .setFooter('Essa mensagem se autodestruirá em 30 segundos...')
                .setImage('https://i.imgur.com/dJ0o6TK.png')
                .setDescription('<@' + message.member.user.id + '>, Para participar do concurso de fotos, ' + 
                    'envie aqui **somente o arquivo da screenshot/foto** em algum dos formatos: **PNG, JPG ou JPEG**, ' + 
                    'apenas desta forma você estará participando.\n' + 
                    'Boa sorte CMDR! exemplo abaixo:');
            message.channel.send({'embed': embed}).then(msgSended => {
                    msgSended.delete(30000);
            }).catch(error => {
                console.log(error);
            });
        } else if (message.embeds && message.embeds.length > 0) {
            const msgEmbed = message.embeds[0];
            if (msgEmbed.description.indexOf('Boa sorte CMDR!') === -1) {
                message.delete();
            }
        } else if(message.attachments && message.attachments.size > 0) {
            const msgAttachment = message.attachments.first();
            const validExtensions = ['png', 'jpg', 'jpeg'];
            const fileExtension = msgAttachment.filename.substring(
                msgAttachment.filename.lastIndexOf('.')+1, msgAttachment.filename.length);
            if (!validExtensions.includes(fileExtension)) {
                const embed = new RichEmbed()
                    .setColor(wingColor)
                    .setAuthor(utils.getUserNickName(message), utils.getUserAvatar(message))
                    .setFooter('Essa mensagem se autodestruirá em 30 segundos...')
                    .setDescription('<@' + message.member.user.id + '>, ' + 
                        'O formato do arquivo enviado é inválido, envie a screenshot em um dos formatos: **PNG, JPG ou JPEG**, ' + 
                        'apenas desta forma você estará participando.\n' + 
                        'Boa sorte CMDR!');
                message.channel.send({'embed': embed}).then(msgSended => {
                    message.delete();
                    msgSended.delete(30000);
                });
            } else {
                logger.info(logName + ' ' + utils.getUserNickName(message) + ' adding a new image');
                
                const embed = new RichEmbed()
                    .setColor(wingColor)
                    .setAuthor(utils.getUserNickName(message), utils.getUserAvatar(message))
                    .setDescription('Imagem do comandante: <@' + message.member.user.id + '>.\nBoa sorte CMDR!')
                    .setFooter('Vote nessa foto clicando no joinha abaixo')
                    .setTimestamp();

                setTimeout(() => {
                    if (process.env.IMGUR_CREDENTIALS) {
                        imgur.uploadUrl(msgAttachment.url, albumId).then(function (json) {
                            logger.info(logName + 'Added a screenshot to album: ' + msgAttachment.url);
                            embed.setImage(json.data.link);
                            message.channel.send({'embed': embed}).then(msgSended => {
                                message.delete();
                                msgSended.react('👍');                            
                            });
                        }).catch(function (err) {
                            logger.error(logName + 'Error to adding screenshot to album: ' + msgAttachment.url, err);
                            embed.setImage(msgAttachment.url);
                            message.channel.send({'embed': embed}).then(msgSended => {
                                message.delete();
                                msgSended.react('👍');                            
                            });
                        });
                    } else {
                        embed.setImage(msgAttachment.url);
                        message.channel.send({'embed': embed}).then(msgSended => {
                            message.delete();
                            msgSended.react('👍');                            
                        });
                    }
                }, 2000);
            }
        }
    });
};

module.exports = exports;