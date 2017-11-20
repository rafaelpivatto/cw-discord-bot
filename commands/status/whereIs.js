const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const cheerio = require('cheerio');

const utils = require('../../modules/utils.js');
const getFromUrl = require('../../modules/gateway/getFromUrl.js');
const errorMessage = require('../../modules/message/errorMessage.js');

const logName = '[WhereIs]',
    wingColor = '#f00000',
    rankCombat = [
        'Inofensivo',
        'Quase Inofensivo',
        'Novato',
        'Competente',
        'Experiente',
        'Mestre',
        'Perigoso',
        'Letal',
        'Elite'],
    rankTrade = [
        'Pobre',
        'Quase pobre',
        'Camelô',
        'Negociante',
        'Mercador',
        'Corretor',
        'Empresário',
        'Magnata',
        'Elite'
    ],
    rankExploration = [
        'Perdido',
        'Quase perdido',
        'Explorador',
        'Cartógrafo',
        'Desbravador',
        'Descobridor',
        'Patrulheiro',
        'Pioneiro',
        'Elite'
    ],
    rankCQC = [
        'Indefeso',
        'Quase Indefeso',
        'Amador',
        'Semiprofissional',
        'Profissional',
        'Campeão',
        'Herói',
        'Lenda',
        'Elite'
    ],
    rankFederation = [
        '',
        'Recruta',
        'Aspirante',
        'Cabo',
        'Terceiro-Sargento',
        'Segundo-Sargento',
        'Primeiro-Sargento',
        'Suboficial',
        'Tenente',
        'Capitão-Tenente',
        'Capitão de Corveta',
        'Capitão de Fragata',
        'Contra-Almirante',
        'Vice-Almirante',
        'Almirante'
    ],
    rankEmpire = [
        '',
        'Forasteiro',
        'Servo',
        'Mestre',
        'Escudeiro',
        'Cavaleiro',
        'Lorde',
        'Barão',
        'Visconde',
        'Conde',
        'Marquês',
        'Duque',
        'Arqui-Duque',
        'Príncipe',
        'Rei'
    ]

module.exports = class WherIsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cmdr',
            group: 'status',
            memberName: 'cmdr',
            description: 'Command to find the commander last position',
            guildOnly: true,
            patterns: [new RegExp('[a-zA-Z]')]
        });
    }

    async run(msg, args) {
        utils.logMessageUserExecuteCommand(logName, msg);

        const commanderName = utils.removeDiacritics(String(args))

        if (!commanderName || commanderName === '') {
            logger.warn(logName + ' Error on retrieving informations about commander.');
            return errorMessage.sendSpecificClientErrorMessage(msg, 
                'Comando inválido, execute !cmdr <NOME DO COMMANDER>');
        }

        getFromUrl.get(logName, 'https://www.edsm.net/api-logs-v1/get-position?commanderName=' + 
            commanderName, function(error, json) {
            
            if (error) {
                logger.error(logName + ' Error on retrieving informations', {'error': error});
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O EDSM não deu permissão para o bot fazer docking, aguarde um instante e tente novamente em breve, Fly safe, CMDR!'
                );
            }

            if (json.msgnum === 203) {
                logger.info(logName + ' commander not found: ' + commanderName);
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O comandante **"' + args + '"**não foi encontrado no EDSM, verifique se o nome está correto.');
            }

            if (!json.system) {
                logger.info(logName + ' commander don\'t have public profile: ' + commanderName);
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'O comandante **"' + args + '"**não tem perfil público no EDSM.');
            }

            const embed = new RichEmbed()
                .setColor(wingColor)
                .setTimestamp()
                .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                .setFooter('Fly safe cmdr!');

            let message = 'Dados do comandante: **' + capitalizeFirstLetter(args) + '**\n' +
                'Último sistema: **' + json.system + '**\n' +
                'Data (UTC): **' + json.date + '**\n';

            getFromUrl.getHtml(logName, json.url, function(error, body){

                if(!error) {
                    const $ = cheerio.load(body);
                    const imgField = $('.img-thumbnail');
                    if (imgField && imgField[0] && imgField[0].attribs['src']) {
                        const img = imgField[0].attribs['src'];
                        embed.setThumbnail('https://www.edsm.net' + img);
                    }
                    const shipField = $('.col-sm-6 > div');
                    if (shipField && shipField[1] && shipField[1].children[3] &&
                        shipField[1].children[3].children[1] && 
                        shipField[1].children[3].children[1].children[0] &&
                        shipField[1].children[3].children[1].children[0].data) {

                        let shipName = shipField[1].children[3].children[1].children[0].data.trim();
                        shipName = shipName.replace(/  /g, '').replace(/\[/g, ' [');

                        message += 'Nave: **' + shipName + '**\n';
                    }
                    if (shipField && shipField[7] && shipField[7].children[3] &&
                        shipField[7].children[3].children[1] && 
                        shipField[7].children[3].children[1].children[0] &&
                        shipField[7].children[3].children[1].children[0].data) {

                        let systemsVisited = shipField[7].children[3].children[1].children[0].data.trim();
                        systemsVisited = systemsVisited.replace(/\,/g, '.');

                        message += 'Sistemas visitados: **' + systemsVisited + '**\n';
                    }
                    if (shipField && shipField[8] && shipField[8].children[3] &&
                        shipField[8].children[3].children[1] && 
                        shipField[8].children[3].children[1].children[0] &&
                        shipField[8].children[3].children[1].children[0].data) {

                        let systemsDiscoveryFirst = shipField[8].children[3].children[1].children[0].data.trim();
                        systemsDiscoveryFirst = systemsDiscoveryFirst.replace(/\,/g, '.');

                        message += 'Sistemas encontrados (edsm): **' + systemsDiscoveryFirst + '**\n\n';
                    }
                }

                getFromUrl.get(logName, 'https://www.edsm.net/api-commander-v1/get-ranks?commanderName=' + 
                    commanderName, function(error, data){

                    if(!error && data.ranks) {
                        message += '__Ranks__\n';
                        
                        message += 'Combate: **' + data.ranksVerbose.Combat + ' / ' + 
                            rankCombat[data.ranks.Combat] + ' (' + data.progress.Combat + '%)**\n';
                        
                        message += 'Comércio: **' + data.ranksVerbose.Trade + ' / ' + 
                        rankTrade[data.ranks.Trade] + ' (' + data.progress.Trade + '%)**\n';
                        
                        message += 'Exploração: **' + data.ranksVerbose.Explore + ' / ' + 
                        rankExploration[data.ranks.Explore] + ' (' + data.progress.Explore + '%)**\n';

                        message += 'CQC: **' + data.ranksVerbose.CQC + ' / ' + 
                        rankCQC[data.ranks.CQC] + ' (' + data.progress.CQC + '%)**\n';

                        message += 'Federação: **' + data.ranksVerbose.Federation + ' / ' + 
                        rankFederation[data.ranks.Federation] + ' (' + data.progress.Federation + '%)**\n';

                        message += 'Império: **' + data.ranksVerbose.Empire + ' / ' + 
                        rankEmpire[data.ranks.Empire] + ' (' + data.progress.Empire + '%)**\n';
                    }
                    
                    embed.setDescription(message);
                    return msg.embed(embed);
                });     
            });                   
        });
        
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
}    