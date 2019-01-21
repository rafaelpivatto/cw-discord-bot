const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');
const cheerio = require('cheerio');

const utils = require('../../modules/utils.js');
const getFromUrl = require('../../modules/gateway/getFromUrl.js');
const errorMessage = require('../../modules/message/errorMessage.js');
const mongoConnection = require('../../modules/connection/mongoConnection.js');

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
        'Nenhum',
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
        'Nenhum',
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

        let commanderId, commanderName;
        if (args.indexOf('<@') !== -1) {
            commanderId = args.replace('<', '').replace('@', '').replace('!', '').replace('>', '');

            mongoConnection.find(logName, {_id: commanderId}, 'cwUsers', (error, data) => {
                if (error) {
                    logger.error(logName + ' Error on retrieving informations', {'error': error});
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        'Houve um erro ao consultar esse commander, tente novamente em breve, Fly safe, CMDR!'
                    );
                }
                if (!data || data.length === 0) {
                    logger.error(logName + ' User not associated', {'error': error});
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        'O usuário ' + args + ' não tem perfil do discord vinculado ao EDSM.\n\n' +
                        'Para associar seu usuário do EDSM no discord, execute o comando !edsm nome_do_comander ou !edsm link_do_edsm.\n\n' +
                        'Após esse procedimeno você poderá consultar usando o comando !cmdr @seu_usuario_discord\n\n' +
                        '* Não esqueça de deixar o perfil público no EDSM (imagem abaixo)',
                        '', 'https://i.imgur.com/H6qW6cQ.png' 
                    );
                } else {
                    findCommanderInfo(data[0].commanderName);
                }
            });
        } else {
            commanderName = utils.removeDiacritics(String(args))
            if (!commanderName || commanderName === '') {
                logger.warn(logName + ' Error on retrieving informations about commander.');
                return errorMessage.sendSpecificClientErrorMessage(msg, 
                    'Comando inválido, execute !cmdr <NOME DO COMMANDER>');
            }
            findCommanderInfo(commanderName);
        }

        
        function findCommanderInfo(commanderName) {
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
                        'O comandante **"' + args + '"** não foi encontrado no EDSM, verifique se o nome está correto.\n\n' +
                        'Para associar seu usuário do EDSM no discord, execute o comando !edsm nome_do_comander ou !edsm link_do_edsm.\n' +
                        'Após esse procedimeno você poderá consultar usando o comando !cmdr @seu_usuario_discord\n\n' +
                        '* Não esqueça de deixar o perfil público no EDSM (imagem abaixo)',
                        '', 'https://i.imgur.com/H6qW6cQ.png' 
                    );
                }

                if (!json.system) {
                    logger.info(logName + ' commander don\'t have public profile: ' + commanderName);
                    return errorMessage.sendSpecificClientErrorMessage(msg, 
                        'O comandante **"' + args + '"**não tem perfil público no EDSM.\n\n' +
                        'Para deixar o perfil público no EDSM siga as recomendações abaixo:',
                        '', 'https://i.imgur.com/H6qW6cQ.png'
                    );
                }

                const embed = new RichEmbed()
                    .setColor(wingColor)
                    .setTimestamp()
                    .setAuthor(utils.getUserNickName(msg), utils.getUserAvatar(msg))
                    .setFooter('Fly safe cmdr!');

                let message = 'Dados do comandante: **' + commanderName + '**\n' +
                    'Último sistema: **' + json.system + '**\n' +
                    'Data do último envio (UTC): **' + json.date + '**\n\n';

                getFromUrl.getHtml(logName, json.url, function(error, body){

                    if(!error) {
                        const $ = cheerio.load(body);
                        const siteDivs = $('.col-md-6 > div');
                        
                        //thumbnail
                        const imgField = $('.img-thumbnail');
                        const imgThumbnail = _try(() => imgField[0] && imgField[0].attribs['src']);
                        if (imgThumbnail) {
                            embed.setThumbnail('https://www.edsm.net' + imgThumbnail);
                        }
                        
                        //ship image
                        const imgShipField = $('.img-thumbnail img');
                        const imgShip = _try(() => imgShipField[0].attribs['src']);
                        if (imgShip){
                            embed.setImage('https://www.edsm.net' + imgShip);
                        }

                        //memberSince
                        const memberSince = _try(() => siteDivs[3].children[3].children[1].children[0].data);
                        if (memberSince) {
                            message += 'Joga Elite desde: **' + memberSince + '**\n';
                        }
                        
                        //shipName
                        let shipName = _try(() => siteDivs[1].children[3].children[1].children[0].data.trim());
                        if (shipName) {                            
                            shipName = shipName.replace(/  /g, '').replace(/\[/g, ' [');
                            message += 'Nave atual: **' + shipName + '**\n';
                        }

                        //systemsVisited
                        let systemsVisited = _try(() => siteDivs[7].children[3].children[1].children[0].data);
                        if (systemsVisited) {
                            systemsVisited = systemsVisited.trim().replace(/\,/g, '.');
                            message += 'Sistemas visitados (EDSM): **' + systemsVisited + '**\n';
                        }

                        //systemsDiscoveryFirst
                        let systemsDiscoveryFirst = _try(() => siteDivs[8].children[3].children[1].children[0].data);
                        if (systemsDiscoveryFirst) {                            
                            systemsDiscoveryFirst = systemsDiscoveryFirst.trim().replace(/\,/g, '.');
                            message += 'Sistemas encontrados (EDSM): **' + systemsDiscoveryFirst + '**\n';
                        }

                        //systemsSubmmited
                        let systemsSubmmited = _try(() => siteDivs[5].children[3].children[1].children[0].data);
                        if (systemsSubmmited) {
                            systemsSubmmited = systemsSubmmited.trim().replace(/\,/g, '.');
                            message += 'Sistemas enviados/confirmados (EDSM): **' + systemsSubmmited + '**\n\n';
                        }
                    }

                    getFromUrl.get(logName, 'https://www.edsm.net/api-commander-v1/get-ranks?commanderName=' + 
                        commanderName, function(error, data){

                        if(!error && data.ranks) {
                            message += '__Ranks:__\n';
                            
                            message += getEmoji(msg, 'EliteCombat') + 'Combate: **' + data.ranksVerbose.Combat + ' / ' + 
                                rankCombat[data.ranks.Combat] + ' ( ' + data.progress.Combat + '% ' + (data.ranks.Combat+1) + '/'+ rankCombat.length + ' )**\n';
                            
                            message += getEmoji(msg, 'EliteTrading') + 'Comércio: **' + data.ranksVerbose.Trade + ' / ' + 
                            rankTrade[data.ranks.Trade] + ' (' + data.progress.Trade + '% ' + (data.ranks.Trade+1) + '/'+ rankTrade.length + ' )**\n';
                            
                            message += getEmoji(msg, 'EliteExploration') + 'Exploração: **' + data.ranksVerbose.Explore + ' / ' + 
                            rankExploration[data.ranks.Explore] + ' (' + data.progress.Explore + '% ' + (data.ranks.Explore+1) + '/'+ rankExploration.length + ' )**\n\n';

                            message += 'CQC: **' + data.ranksVerbose.CQC + ' / ' + 
                            rankCQC[data.ranks.CQC] + ' (' + data.progress.CQC + '% ' + (data.ranks.CQC+1) + '/'+ rankCQC.length + ' )**\n\n';

                            message += 'Federação: **' + data.ranksVerbose.Federation + ' / ' + 
                            rankFederation[data.ranks.Federation] + ' (' + data.progress.Federation + '% ' + data.ranks.Federation+ '/'+ (rankFederation.length-1) + ' )**\n';

                            message += 'Império: **' + data.ranksVerbose.Empire + ' / ' + 
                            rankEmpire[data.ranks.Empire] + ' (' + data.progress.Empire + '% ' + data.ranks.Empire+ '/'+ (rankEmpire.length-1) + ' )**\n\n';

                            message += '[Link do perfil no EDSM](' + json.url + ')\n\n';

                            message += 'Nave atual: \n';
                        }
                        
                        embed.setDescription(message);
                        return msg.embed(embed);
                    });     
                });                   
            });
        }
        
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function getEmoji(msg, name) {
            const emoji = msg.client.emojis.find(emoji => emoji.name === name);
            if (emoji) {
                return `<:${emoji.identifier}> `;
            } else {
                return '';
            }
        }

        function _try(func, fallbackValue = null) {
            try {
                const value = func();
                return (value === null || value === undefined) ? fallbackValue : value;
            } catch (e) {
                return fallbackValue;
            }
        }
    }
}    