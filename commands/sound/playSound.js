const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const ytdl = require('ytdl-core');
const YoutubeDL = require('youtube-dl');
const { RichEmbed } = require('discord.js');

const errorMessage = require('../../modules/message/errorMessage.js')

const logName = '[PlaySound]';
const wingColor = '#f00000';
let connection,
    playlist = [],
    dispatcher,
    musicPlaying;

module.exports = class PlaySoundCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'musica',
            group: 'sound',
            memberName: 'playmusic',
            description: 'Command to play music on channel',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
        client.on('ready', (arg) => {
            const channel = client.channels.find('name', process.env.MUSIC_SOUND_CHANNEL);
            if (channel && channel.type === 'voice') {
                channel.join().then(conn => {
                    connection = conn;
                }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
            }
        });
    }

    async run(msg, args) {
        const musicChannel = process.env.MUSIC_TEXT_CHANNEL;
        if (musicChannel && musicChannel !== msg.message.channel.name) {
            return errorMessage.sendSpecificClientErrorMessage(msg, 
                'Por favor, execute os comandos de música na sala <#' + msg.client.channels.find('name', musicChannel).id + '>');
        }

        logger.info(logName + ' Execute command by user = ' + msg.message.author.username + ' >>> ' + args);

        if(isAddCommands(args)) {
            const music = args.replace('add', '').trim();
            if (!music || music === '') {
                return msg.channel.send('Envie **!musica add <nome da musica>** ou ' +
                    '**!musica add <link do youtube>** para adicionar uma música à playlist');
            } else {
                searchSong(msg, music)
            }
        } else if(isModeratorCommands(args)) {
            if (isModeratorUser(msg) && dispatcher) {
                setControllCommand(args);
            } else {
                return msg.channel.send('Você não tem permissão para executar esse comando, solicite a algum moderador.');
            }
        } else if(isNextCommand(args)) {
            if (isModeratorUser(msg) || isRequesterMusicPlaying(msg)) {
                setControllCommand(args);
            } else {
                return msg.channel.send('Você só pode passar músicas que você adicionou à playlist.');
            }
        } else {
            return msg.channel.send('Comando "' + args + '" inválido, se precisar de ajuda !ajudamusica');
        }
        
        //--- Functions ---
        function searchSong(msg, music) {

            // Get the video information.
		    msg.channel.send('Pesquisando por "'+ music + '"...').then(response => {
                
                var searchstring = music
                if (!music.toLowerCase().startsWith('http')) {
                    searchstring = 'gvsearch1:' + music;
                }

                YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
                    // Verify the info.
                    if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
                        return response.edit('A pesquisa não retornou nenhum resultado :(');
                    }
                    
                    info.requesterId = msg.author.id;
                    info.requester = msg.author;

                    // Queue the video.

                    let embed = new RichEmbed()
                        .setColor(wingColor)
                        .setTimestamp()
                        .setAuthor(msg.author.username, getCleanUrl(msg.author))
                        .setThumbnail(info.thumbnail)
                        .setFooter('Listen safe cmdr!')
                        .setDescription('Adicionado à playlist...'+ 
                            '\nMúsica: **' + info.title + '**' +
                            '\nPosição: **' + (parseInt(playlist.length) + 1) + '**');

                    response.edit({'embed': embed}).then(() => {
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
                return msg.channel.send('Fim da playlist.');
            }

            // Get the first item in the queue.
            const music = playlist[0];
            
            let embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setAuthor(music.requester.username + ' adicionou essa...', getCleanUrl(music.requester))
                .setThumbnail(music.thumbnail)
                .setFooter('Listen safe cmdr!')
                .setDescription('Tocando agora...'+ 
                    '\nMúsica: **' + music.title + '**' +
                    '\nDuração: **' + music.duration + '**');

            msg.channel.send({'embed': embed}).then(response => {
                
                if (!connection) {
                    const channel = msg.client.channels.find('name', process.env.MUSIC_SOUND_CHANNEL);
                    if (channel && channel.type === 'voice') {
                        channel.join().then(conn => {
                            connection = conn;
                        }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
                    }
                }

                const stream = ytdl(music.webpage_url, { filter : 'audioonly' });
                dispatcher = connection.playStream(stream, { seek: 0, volume: 0.1 });
                musicPlaying = music;

                connection.on('error', (error) => {
					// Skip to the next song.
					console.log(error);
					playlist.shift();
					executePlaylist(msg, playlist);
                });
                
                dispatcher.on('error', (error) => {
					// Skip to the next song.
					console.log(error);
					playlist.shift();
					executePlaylist(msg, playlist);
				});

				dispatcher.on('end', () => {
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

            }).catch(console.log);
        }

        function isAddCommands(args) {
            return args.indexOf('add') >= 0;
        }

        function isModeratorCommands(args) {
            const controlls = ['limpar','pausar', 'continuar','vol+','vol-'];
            return controlls.includes(args);
        }

        function isNextCommand(args) {
            return args === 'proxima';
        }

        function isModeratorUser(msg) {
            if (process.env.MUSIC_ADMIN_ROLE) {
                return msg.member.roles.find('name', process.env.MUSIC_ADMIN_ROLE);
            }
            return true;
        }

        function isRequesterMusicPlaying(msg) {
            return musicPlaying.requesterId === msg.author.id;
        }

        function setControllCommand(args) {
            switch (args) {
                case 'proxima':
                if (connection.paused) dispatcher.resume();
                dispatcher.end();
                break;

                case 'limpar':
                playlist = [];
                if (connection.paused) dispatcher.resume();
                dispatcher.end();
                break;

                case 'pausar':
                dispatcher.pause();
                break;

                case 'continuar':
                dispatcher.resume();
                break;

                case 'vol+':
                if (Number(dispatcher.volume).toFixed(1) < 1) {
                    dispatcher.setVolume(dispatcher.volume+0.1);
                }
                break;

                case 'vol-':
                if (Number(dispatcher.volume).toFixed(1) > 0.1) {
                    dispatcher.setVolume(dispatcher.volume-0.1);
                }
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
    }    
}    