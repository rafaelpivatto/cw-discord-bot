const { Command } = require('discord.js-commando');
const logger = require('heroku-logger');
const ytdl = require('ytdl-core');

let dispatcher;

module.exports = class PlaySoundCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'music',
            group: 'sound',
            memberName: 'playsound',
            description: 'Command to play sound',
            //guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {

        if (args === 'stop' && dispatcher) {
            dispatcher.end();
            return;
        }

        if (args === 'pause' && dispatcher) {
            dispatcher.pause();
            return;
        }

        if (args === 'resume' && dispatcher) {
            dispatcher.resume();
            return;
        }

        if (args === 'volume+' && dispatcher && dispatcher.volume < 1) {
            dispatcher.setVolume(dispatcher.volume+0.1);
            return;
        }

        if (args === 'volume-' && dispatcher && dispatcher.volume > 0.1) {
            dispatcher.setVolume(dispatcher.volume-0.1);
            return;
        }

        if (dispatcher) {
            dispatcher.end();
        }
        
        logger.info('[PlaySound] Execute play sound command by user = ' + msg.message.author.username);

        const streamOptions = { seek: 0, volume: 0.2 };
        var voiceChannel = msg.message.member.voiceChannel;

        voiceChannel.join().then(connection => {
            
            const stream = ytdl(args, { filter : 'audioonly' });
            dispatcher = connection.playStream(stream, streamOptions);

            dispatcher.on("end", end => {
                voiceChannel.leave();
            });
        }).catch(err => console.log(err));
        
    }
}    