const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const request = require('request');
const cheerio = require('cheerio');
const wrapLine = "\n";
const wingUrl = "https://eddb.io/faction/74863";
const wingThumb = "http://i.imgur.com/ro5DQx9.png";
const wingUrlSite = "http://elitedangerouscobra.com.br";
const wingColor = "#f00000";
const errorMessage = require("../../modules/errorMessage.js");
const normalizeWingInfo = require("../../modules/normalizeWingInfo");
const mongoConnection = require("../../modules/mongoConnection");
const utils = require("../../modules/utils");

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
            if (error) {
                console.log('error:', error);
                return errorMessage.sendClientErrorMessage(msg);
            }
            if (response && response.statusCode != 200) {
                console.log('statusCode:', response.statusCode);
                console.log('statusMessage:', response.statusMessage);
                return errorMessage.sendClientErrorMessage(msg);
            }
            const $ = cheerio.load(body);
            const data = normalizeWingInfo.getInfos(body);
            saveToMongo(data);
            if (data.wingName == null) {
                console.log('Wing name not found.');
                return errorMessage.sendClientErrorMessage(msg);
            }
            var embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setTitle("**Sistemas e influências da " + data.wingName + "**")
                .setDescription("Dados extraídos do [eddb.io](" + wingUrl + ")")
                .setThumbnail(wingThumb)
                .setFooter("Fly safe cmdr!")
                .setURL(wingUrlSite);
            
            for(let info of data.infos) {
                embed.addField("**" + getSystemName(info) + "**",
                    "**Influência: ** "+ utils.rpad(getInfluence(info), 10) + " " + 
                    "**Att. à " + info.eddbUpdate + "**" + wrapLine +
                    "**Segurança: ** " + info.security + wrapLine + 
                    "**Estado: ** " + info.state);
            }
            return msg.embed(embed);
        });

        function getSystemName(info) {
            let name = info.systemName; 
            if (info.controlledSystem) {
                name += ' :crown:';
            }
            if (info.state === 'War') {
                name += ' :crossed_swords:';
            }
            if (info.state === 'Election') {
                name += ' :loudspeaker:';
            }
            if (info.influence < 5.0) {
                name += ' :rotating_light:';
            }
            return name;
        }

        function getInfluence(info) {
            return String(info.influence).replace('.', ',') + '%';
        }

        function saveToMongo(data) {
            mongoConnection.saveOrUpdate(data, 'wingData', function(error) {
                if (error) console.log(error);
            });
        }
    }
}