const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const request = require('request');
const cheerio = require('cheerio');
const wrapLine = "\n";
const wingUrl = "https://eddb.io/faction/74863";
const wingThumb = "http://i.imgur.com/ro5DQx9.png";
const wingUrlSite = "http://elitedangerouscobra.com.br";
const wingColor = "#f00000";

module.exports = class EmbedCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cwstatus',
            group: 'status',
            memberName: 'status',
            description: 'Verify CW status'
        });
    }

    async run(msg, args) {
        let out = '';
        request(wingUrl, function (error, response, body) {

            // Print the error if one occurred 
            if (error) {
                console.log('error:', error);
                sendClientErrorMessage(msg);
            }
            // Print the response status code if a response was received 
            if (response && response.statusCode != 200) {
                console.log('statusCode:', response.statusCode);
                console.log('statusMessage:', response.statusMessage);
                sendClientErrorMessage(msg);
            }
            const $ = cheerio.load(body);
            const wingName = getWingName($, msg);
            
            if (wingName != null) {
                const systems = $('.systemRow strong a');
                const tableInfo = $('.systemRow .semi-strong');
                let idxControlledSystem = 0;
                let tablePosition = 0;
                let tableStatePosition = 3;

                if (systems && systems.length > 0 && tableInfo && tableInfo.length > 0) {
                    var embed = new RichEmbed()
                            .setColor(wingColor)
                            .setTimestamp()
                            .setTitle("**Sistemas e influências da " + wingName + "**")
                            .setDescription("Dados extraídos do [eddb.io](" + wingUrl + ")")
                            .setThumbnail(wingThumb)
                            .setFooter("Fly safe cmdr!")
                            .setURL(wingUrlSite);
                    
                    for(let i=0; i < systems.length; i++) {
                        let systemName = systems[i].children[0].data;
                        if (isSystemControlled($, ++idxControlledSystem)) {
                            idxControlledSystem++;
                            systemName += " :crown:";
                        }
                        const influence = $('.systemFactionRow.isHighlighted .factionInfluence .semi-strong')[i].children[0].data;
                        const state = $('.systemFactionRow.isHighlighted .semi-strong')[tableStatePosition].children[0].data;
                        if (state === "War") {
                            systemName += " :crossed_swords:";
                        }
                        if (state === "Election") {
                            systemName += " :loudspeaker:";
                        }
                        embed.addField("**" + systemName + "** ",
                            "**Influência: ** "+ influence + wrapLine +
                            "**Segurança: ** " + tableInfo[tablePosition++].children[0].data + wrapLine +
                            "**Estado: ** " + state
                        );
                        tablePosition += 4;
                        tableStatePosition += 4;
                    }
                    return msg.embed(embed);
                }
            } else {
                console.log('Wing name not found.');
                sendClientErrorMessage(msg);
            }
        });

        function isSystemControlled($, idxControlledSystem) {
            const obj = $('.systemRow strong a, .systemFactionRow.isHighlighted .systemPresenceTag .fa-flip-vertical')[idxControlledSystem];
            return obj && obj.name && obj.name === 'i';
        }

        function getWingName($) {
            if ($('h1')[0] && 
                $('h1')[0].children &&
                $('h1')[0].children.length >= 2  && 
                $('h1')[0].children[2].data) {
                
                return $('h1')[0].children[2].data.trim();
            } else {
                return null;
            }
        }

        function sendClientErrorMessage(msg) {
            msg.channel.send("Ops, algo deu errado, tente novamente mais tarde e fly safe cmdr!");
        }
    }
}