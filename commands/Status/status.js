const Commando = require('discord.js-commando');
const request = require('request');
const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const wrap = "\n";

class StatusCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cwstatus',
            group: 'status',
            memberName: 'status',
            description: 'Verify CW status'
        });
    }

    async run(message, args) {
        let out = '';
        request('https://eddb.io/faction/74863', function (error, response, body) {
            // Print the error if one occurred 
            if (error) {
                console.log('error:', error);
                sendClientErrorMessage(message);
            }
            // Print the response status code if a response was received 
            if (response && response.statusCode != 200) {
                console.log('statusCode:', response.statusCode);
                console.log('statusMessage:', response.statusMessage);
                sendClientErrorMessage(message);
                return;
            }
            
            const $ = cheerio.load(body);
            const wingName = getWingName($, message);
            if (wingName != null) {
            
                out += "```Markdown" + wrap;
                out += "Status da " + wingName + " em [" + getGMTDate() + "]"+ wrap + wrap;

                const systems = $('.systemRow strong a');
                const tableInfo = $('.systemRow .semi-strong');
                let tablePosition = 0;

                if (systems && systems.length > 0 && tableInfo && tableInfo.length > 0)
                for(let i=0; i < systems.length; i++) {
                    const systemName = systems[i].children[0].data;
                    const influence = $('.systemFactionRow.isHighlighted .factionInfluence .semi-strong')[i].children[0].data
                    
                    out += "> System: " + systemName + wrap;
                    out += "> Influence: " + influence + wrap;
                    out += "> Security: " + getInfo(tableInfo, tablePosition++) + wrap;
                    out += "> State: " + getInfo(tableInfo, tablePosition++) + wrap;
                    //out += "> Population: " + getInfo(tableInfo, tablePosition++) + wrap;
                    //out += "> Power: " + getInfo(tableInfo, tablePosition++) + wrap;
                    //out += "> Distance from sol: " + getInfo(tableInfo, tablePosition++) + "Ly" + wrap;
                    tablePosition = tablePosition+3;
                    out += wrap;
                }

                out += "```";
                message.channel.send(out);
            } else {
                console.log('Wing name not found.');
                sendClientErrorMessage(message);
            }
        });

        function getGMTDate() {
            const now = new Date();
            let isoDate = new Date(now).toISOString();
            isoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
            return dateFormat(isoDate, "UTC:dd/mm/yyyy HH:MM");

        }

        function getInfo(tableInfo, tablePosition) {
            return tableInfo[tablePosition].children[0].data;
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

        function sendClientErrorMessage(message) {
            message.channel.send("Ops, something it's wrong, try again later, sorry and fly safe!");
        }
    }
}

module.exports = StatusCommand;