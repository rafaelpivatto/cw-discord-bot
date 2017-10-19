const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const ytdl = require('ytdl-core');
const YoutubeDL = require('youtube-dl');
const { RichEmbed } = require('discord.js');

const errorMessage = require('../../modules/message/errorMessage.js')

const logName = '[PlaySound]';
const wingColor = '#f00000';
const streamOptions = { 
    filter : 'audioonly',
    quality: 'lowest' 
};
let connection,
    channel,
    playlist = [],
    dispatcher,
    musicPlaying;

module.exports = class PlaySoundCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'musica',
            group: 'music',
            memberName: 'playmusic',
            description: 'Command to play music on channel',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        logger.info(logName + ' Execute command by user = ' + msg.message.author.username + ' >>> ' + args);

        if (!checkRequirements(msg)) {
            return;
        }

        if(isAddCommands(args)) {
            const music = args.replace('add', '').trim();
            if (!music || music === '') {
                return msg.channel.send('Envie **!musica add <nome da musica>** ou ' +
                    '**!musica add <link do youtube>** para adicionar uma música à fila');
            } else {
                searchSong(msg, music)
            }
        } else if(isModeratorCommands(args)) {
            if (isModeratorUser(msg) && dispatcher) {
                setControllCommand(args, msg);
            } else {
                logger.info(logName + ' user dont have permission');
                return msg.channel.send('Você não tem permissão para executar esse comando, solicite a algum moderador.');
            }
        } else if(isCommunityCommand(args)) {
            setControllCommand(args, msg);
        } else {
            return msg.channel.send('Comando "' + args + '" inválido, se precisar de ajuda !ajudamusica');
        }
        
        //--- Functions ---
        function searchSong(msg, music) {

            // Get the video information.
		    msg.channel.send('Pesquisando por "'+ music + '"...').then(response => {
                
                var searchstring = music
                if (!music.toLowerCase().startsWith('http')) {
                    searchstring = 'gvsearch1:' + music + ' Official Audio';
                }

                const params = ['-q', '--no-warnings', '--force-ipv4', 
                                '--no-playlist', '--hls-prefer-ffmpeg'];
                YoutubeDL.getInfo(searchstring, params, {maxBuffer: 'Infinity'}, (err, info) => {
                    // Verify the info.
                    if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
                        if (err) {
                            logger.error('Error: ', err);
                        }
                        if (info) {
                            logger.error('Info: ', info);
                        }
                        return response.edit('Houve um erro ao pesquisar a musica :(\n'
                            + 'Tente novamente ou adicione a música pelo link do youtube ;)');
                    }
                    
                    info.requester = {
                        id: msg.author.id,
                        avatarURL: msg.author.avatarURL,
                        defaultAvatarURL: msg.author.defaultAvatarURL,
                        nickname: msg.member.nickname || msg.message.author.username
                    };

                    // Queue the video.

                    let embed = new RichEmbed()
                        .setColor(wingColor)
                        .setTimestamp()
                        .setAuthor(info.requester.nickname, getCleanUrl(msg.author))
                        .setThumbnail(info.thumbnail)
                        .setFooter('Listen safe, cmdr!')
                        .setDescription('Adicionado à fila...'+ 
                            '\nMúsica: **' + info.title + '**' +
                            '\nDuração: **' + info._duration_hms + '**' +
                            '\nPosição: **' + (parseInt(playlist.length) + 1) + '**');

                    response.edit({'embed': embed}).then(() => {
                        logger.info(logName + ' Adicionado à fila ' + info.title + ', duração: ' + info._duration_hms);
                        playlist.push(info);
                        
                        // Play if only one element in the playlist.
                        if (playlist.length === 1) executePlaylist(msg, playlist);
                    }).catch(console.log);
                });
            }).catch(console.log);
        }

        function executePlaylist(msg, playlist) {
            // If the playlist is empty, finish.
            if (playlist.length === 0) {
                connection = null;
                channel.leave();
                return msg.channel.send('Fim da fila, não deixe a festa acabar, adicione mais músicas. :tada:');
            }

            // Get the first item in the queue.
            const music = playlist[0];
            
            msg.channel.send('Trocando o disco, a próxima musica já vai começar :musical_note:').then(response => {
                
                getConnection(function(error){

                    if (error) {
                        return msg.channel.send('Houve um erro inesperado, por favor avise algum admin-bot');
                    }

                    const stream = ytdl(music.webpage_url, streamOptions);
                    dispatcher = connection.playStream(stream, { volume: 0.1, passes: 1});
                    musicPlaying = music;
                    
                    logger.info(logName + ' Tocando a música ' + music.title + ', duração: ' + music._duration_hms);
                    const embed = new RichEmbed()
                        .setColor(wingColor)
                        .setTimestamp()
                        .setAuthor(music.requester.nickname + ' adicionou essa...', getCleanUrl(music.requester))
                        .setThumbnail(music.thumbnail)
                        .setFooter('Listen safe, cmdr!')
                        .setDescription('Tocando agora...'+ 
                            '\nMúsica: **' + music.title + '**' +
                            '\nDuração: **' + music._duration_hms + '**');
    
                    setTimeout(() => {
                        response.edit({'embed': embed});
                    }, 7000);
                    
                    connection.on('error', (error) => {
                        // Skip to the next song.
                        logger.error(logName + ' ' + error);
                        msg.channel.send('Houve um erro inesperado, por favor avise algum admin-bot');
                        playlist.shift();
                        executePlaylist(msg, playlist);
                    });
                    
                    dispatcher.on('error', (error) => {
                        // Skip to the next song.
                        logger.error(logName + ' ' + error);
                        msg.channel.send('Houve um erro inesperado, por favor avise algum admin-bot');
                        playlist.shift();
                        executePlaylist(msg, playlist);
                    });
    
                    dispatcher.on('end', () => {
                        stream.end();
                        logger.info(logName + ' fim da música.');
                        // Wait a second.
                        setTimeout(() => {
                            if (playlist.length > 0) {
                                // Remove the song from the playlist.
                                playlist.shift();
                                // Play the next song in the playlist.
                                executePlaylist(msg, playlist);
                            }
                        }, 1000);
                    });
                });
            }).catch(console.log);
        }

        function getConnection(callback) {
            if (!connection || !channel) {
                logger.info(logName + ' Getting a connection and connect to channel');
                channel = msg.client.channels.find('name', process.env.MUSIC_SOUND_CHANNEL);
                if (channel && channel.type === 'voice') {
                    channel.join().then(conn => {
                        connection = conn;
                        callback();
                    }).catch(err => {
                        logger.error('Erro ao conectar na sala de musica: ' + err);
                        callback('error');
                    });
                } else {
                    callback('error');
                }
            } else {
                callback();
            }
            
        }

        function isAddCommands(args) {
            return args.indexOf('add') >= 0;
        }

        function isModeratorCommands(args) {
            const controlls = ['limpar-fila','pausar', 'continuar','vol+','vol-'];
            return controlls.includes(args);
        }

        function isCommunityCommand(args) {
            const controlls = ['proxima','fila'];
            return controlls.includes(args);
        }

        function isModeratorUser(msg) {
            if (process.env.MUSIC_ADMIN_ROLE) {
                return msg.member.roles.find('name', process.env.MUSIC_ADMIN_ROLE);
            }
            return true;
        }

        function isRequesterMusicPlaying(msg) {
            return musicPlaying.requester.id === msg.author.id;
        }

        function setControllCommand(args, msg) {
            switch (args) {
                case 'proxima':
                if (isModeratorUser(msg) || isRequesterMusicPlaying(msg)) {
                    if (connection && connection.paused) dispatcher.resume();
                    if (dispatcher) dispatcher.end();
                } else {
                    return msg.channel.send('Você só pode passar músicas que você adicionou à fila.');
                }
                break;

                case 'limpar-fila':
                playlist = [];
                if (connection && connection.paused) dispatcher.resume();
                if (dispatcher) dispatcher.end();
                break;

                case 'pausar':
                if (dispatcher) dispatcher.pause();
                break;

                case 'continuar':
                if (dispatcher) dispatcher.resume();
                break;

                case 'vol+':
                if (dispatcher)
                if (Number(dispatcher.volume).toFixed(1) < 1) {
                    dispatcher.setVolume(dispatcher.volume+0.1);
                }
                break;

                case 'vol-':
                if (dispatcher)
                if (Number(dispatcher.volume).toFixed(1) > 0.1) {
                    dispatcher.setVolume(dispatcher.volume-0.1);
                }
                break;

                case 'fila':
                getPlaylist(msg);
                break;
            }
        }

        function getCleanUrl(member) {
            if (member.avatarURL) {
                const index = member.avatarURL.indexOf('?');
                if (index > 0) {
                    return member.avatarURL.substring(0, index);
                }
            } else {
                return member.defaultAvatarURL;
            }
        }

        function getPlaylist(msg) {
            if (playlist.length > 0) {
                let desc = '';
                for (let i=0; i<playlist.length && i<10; i++) {
                    if (i===0) {
                        desc += ':radio: ';
                        desc += '**Tocando agora:\n';
                        desc += '#' + (Number(i)+1) + '- ' + playlist[i].title + '\n';
                        desc += '\t\tDuração: ' + playlist[i]._duration_hms + ' - por: ' + playlist[i].requester.nickname;
                        desc += '**\n\n';
                    } else {
                        if (i===1) {
                            desc += ':track_next: **Próximas músicas na fila:**\n';
                        }
                        desc += '#' + (Number(i)+1) + '- ' + playlist[i].title + '\n';
                        desc += '\t\tDuração: ' + playlist[i]._duration_hms + ' - por: ' + playlist[i].requester.nickname;
                        desc += '\n';
                    }
                }
                let embed = new RichEmbed()
                    .setColor(wingColor)
                    .setTimestamp()
                    .setFooter('Listen safe, cmdr!')
                    .setTitle('Fila de músicas')
                    .setThumbnail('https://i.imgur.com/2j485bH.png')
                    .setDescription(desc);
                return msg.channel.send({'embed': embed});
            } else {
                return msg.channel.send('A fila está vazia.');
            }
        }

        function checkRequirements(msg) {
            const textChannelAuthorized = process.env.MUSIC_TEXT_CHANNEL;
            const voiceChannelAuthorized = process.env.MUSIC_SOUND_CHANNEL;
            const userTextChannelCommand = msg.message.channel.name;
            const userVoiceChannelConnected = msg.message.member.voiceChannel;
    
            if (!textChannelAuthorized || !voiceChannelAuthorized) {
                errorMessage.sendSpecificClientErrorMessage(msg, 
                    'Desculpe, o comando de música está temporariamente desabilitado.');
                logger.info(logName + ' command disabled');        
                return false;
            }
    
            if (textChannelAuthorized !== userTextChannelCommand) {
                errorMessage.sendSpecificClientErrorMessage(msg, 
                    'Por favor, execute os comandos de música na sala <#' + msg.client.channels.find('name', textChannelAuthorized).id + '>');
                logger.info(logName + ' command executed out of channel');
                return false;
            }
            
            if (!userVoiceChannelConnected || voiceChannelAuthorized !== userVoiceChannelConnected.name) {
                errorMessage.sendSpecificClientErrorMessage(msg, 
                    'Você precisa estar na sala de aúdio ' + voiceChannelAuthorized + ' para executar os comandos de música.');
                logger.info(logName + ' user not in sound channel');
                return false;
            }

            return true;
        }
    }    
}    