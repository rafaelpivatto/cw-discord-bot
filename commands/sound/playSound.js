const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const ytdl = require('ytdl-core');
const YoutubeDL = require('youtube-dl');

const logName = '[PlaySound]';
const streamOptions = { seek: 0, volume: 0.1 };
let connection;
let playlist = [];
let dispatcher;

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
            const channel = client.channels.find('name', process.env.MUSIC_CHANNEL);
            if (channel && channel.type === 'voice') {
                channel.join().then(conn => {
                    connection = conn;
                }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
            }
        });
    }

    async run(msg, args) {
        
        logger.info(logName + ' Execute command by user = ' + msg.message.author.username + ' >>> ' + args);

        if (isControllCommands(args)) {
            if (isModeratorUser(msg) && dispatcher) {
                setControllCommand(args);
            } else {
                return msg.channel.send('Você não tem permissão para executar esse comando.');
            }
        } else {
            if (!args || args === '') {
                return msg.channel.send('Envie **!musica <nome da musica>** ou ' +
                    '**!musica <link do youtube>** para adicionar uma música na playlist');
            }

            searchSong(msg, args)
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
                    
                    info.requester = msg.author.id;

                    // Queue the video.
                    response.edit('Música adicionada na playlist: ' + info.title).then(() => {
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
                return msg.channel.send('Todas as musicas da playlist acabaram.');
            }

            // Get the first item in the queue.
            const music = playlist[0];
            
            msg.channel.send('Reproduzindo agora a musica: ' + music.title).then(response => {
                
                if (!connection) {
                    const channel = msg.client.channels.find('name', process.env.MUSIC_CHANNEL);
                    if (channel && channel.type === 'voice') {
                        channel.join().then(conn => {
                            connection = conn;
                        }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
                    }
                }

                const stream = ytdl(music.webpage_url, { filter : 'audioonly' });
                dispatcher = connection.playStream(stream, streamOptions);

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

        function isControllCommands(args) {
            const controlls = ['proxima', 'limpar','pausar', 'continuar','volume+','volume-'];
            return controlls.includes(args);
        }

        function isModeratorUser(msg) {
            return msg.member.hasPermission('Moderador');
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

                case 'volume+':
                if (dispatcher.volume < 1) {
                    dispatcher.setVolume(dispatcher.volume+0.1);
                }
                break;

                case 'volume-':
                if (dispatcher.volume > 0.1) {
                    dispatcher.setVolume(dispatcher.volume-0.1);
                }
                break;
            }
        }
    }    
}    