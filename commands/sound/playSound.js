const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const ytdl = require('ytdl-core');
const YoutubeDL = require('youtube-dl');

const logName = '[PlaySound]';
const streamOptions = { seek: 0, volume: 0.2 };
let connection;
let playlist = [];
let playingSong = false;

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
        /*client.on('ready', (arg) => {
            const channel = client.channels.find('name', process.env.MUSIC_CHANNEL);
            if (channel && channel.type === 'voice') {
                channel.join().then(conn => {
                    connection = conn;
                }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
            }
        });*/
    }

    async run(msg, args) {
        
        logger.info(logName + ' Execute command by user = ' + msg.message.author.username + ' >>> ' + args);

        if (isControllCommands(args)) {
            if (isModeratorUser(msg) && dispatcher) {
                setControllCommand(args);
            }
        } else {
            
            if (!connection) {
                const channel = msg.client.channels.find('name', process.env.MUSIC_CHANNEL);
                if (channel && channel.type === 'voice') {
                    channel.join().then(conn => {
                        connection = conn;
                    }).catch(err => logger.error('Erro ao conectar na sala de musica: ' + err));
                }
            }

            if (!playingSong) {
                playSong(args);
            } else {
                playlist.push(args);
            }
        }
        
        //--- Functions ---
        function playSong(args) {

            var searchstring = args
			if (!args.toLowerCase().startsWith('http')) {
				searchstring = 'gvsearch1:' + args;
			}

            YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
				// Verify the info.
				if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
					return console.log('Invalid video!');
				}

				// Queue the video.
				response.edit(wrap('Queued: ' + info.title)).then(() => {
                    queue.push(info);
                    
                    //info.title
                    //info.webpage_url
                    //info.requester = msg.author.id;

					
				}).catch(console.log);
			});




            const stream = ytdl(args, { filter : 'audioonly' });
            dispatcher = connection.playStream(stream, streamOptions);
            playingSong = true;

            dispatcher.on('end', () => {
                // Wait a second.
                setTimeout(() => {
                    playingSong = false;
                    if (playlist.length > 0) {
                        playSong(playlist.shift());
                    }
                }, 1000);
            });
        }

        function isControllCommands(args) {
            const controlls = ['proxima', 'limpar','continuar','volume+','volume-'];
            return controlls.includes(args);
        }

        function isModeratorUser(msg) {
            return true;
        }

        function setControllCommand(args) {
            switch (args) {
                case 'proxima':
                dispatcher.end();
                break;

                case 'limpar':
                playlist = [];
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