const { RichEmbed } = require('discord.js');
const logger = require('heroku-logger');

const mongoConnection = require('../connection/mongoConnection.js');

const logName = '[RegistryUserWelcome] ';
const wingColor = '#f00000';
const wingThumb =
  'https://cdn.discordapp.com/attachments/209390265121636352/729077478651461643/722565942298542254.png';

exports.execute = function (client) {
  logger.info(logName + ' start registry discord events');

  if (
    !process.env.GUILD_ID ||
    !process.env.ACCCEPTANCE_RULE ||
    !process.env.USER_PRESENTATION_CHANNEL
  ) {
    logger.error(`${logName} not minimum requirements`);
    return;
  }

  const guild = client.guilds.find((val) => val.id === process.env.GUILD_ID);
  if (!guild) {
    logger.error(
      `${logName} guild with id: '${process.env.GUILD_ID}' not found`
    );
    return;
  }

  client.on('guildMemberAdd', (member) => {
    setTimeout(() => {
      const data = {
        _id: new Date(),
        userName: member.nickname || member.user.username,
        userID: member.user.tag,
        date: new Date(),
      };
      if (member.guild.id !== process.env.GUILD_ID) {
        logger.error(`guild with id: '${process.env.GUILD_ID}' not found`);
        return;
      }

      if (process.env.ENABLED_ADMINISTRATION === 'true') {
        mongoConnection.saveOrUpdate(logName, data, 'userJoin', () => {});
      }

      const role = member.guild.roles
        .filter((role) => role.name === process.env.ACCCEPTANCE_RULE)
        .first();
      if (!role) {
        logger.error(
          `${logName} Role not found to apply => '${process.env.ACCCEPTANCE_RULE}'`
        );
      } else {
        member.addRole(role, 'added by bot when member joined.');
      }

      const channel = member.guild.channels.find(
        (val) => val.name === process.env.USER_PRESENTATION_CHANNEL
      );
      if (channel) {
        const rulesChannel = member.guild.channels.find(
          (val) => val.name === process.env.RULES_CHANNEL
        );
        const rulesChannelText = rulesChannel
          ? `<#${rulesChannel.id}>`
          : '#regras';

        const faqChannel = member.guild.channels.find((val) => val.name === 'faq');
        const faqChannelText = faqChannel ? `<#${faqChannel.id}>` : '#faq';

        const botChannel = member.guild.channels.find(
          (val) => val.name === 'zueira_bot'
        );
        const botChannelText = botChannel
          ? `<#${botChannel.id}>`
          : '#zueira_bot';

        const memberId = member.user.id;

        const welcomeMessage = `
            Seja bem-vindo(a) à **Cobra Wing**.
            \nNo Elite Dangerous, nosso grupo privado é: **COBRA BR** e nosso esquadrão: **Cobra Wing Academy [CWAC]**.
            \nPara solicitar acesso digite **!grupoprivado** e/ou **!esquadrao** e/ou **!inara** na sala ${botChannelText} e siga as instruções.
            \nLeia as ${rulesChannelText} e o ${faqChannelText}, também pedimos que __use o mesmo apelido em jogo aqui no discord__, para ajudar na nossa identificação.
            \nAgora você é um convidado, __após entrar para o nosso esquadrão e inara__ você terá acesso as demais salas aqui no nosso discord.
            \nQuaisquer dúvidas é só perguntar. :wink:
            `;

        let embed = new RichEmbed()
          .setColor(wingColor)
          .setTimestamp()
          .setThumbnail(wingThumb)
          .setFooter('Enjoy and fly safe, commander!!')
          .setDescription(welcomeMessage);

        channel.send(`Olá <@${memberId}>`).catch(console.log);
        channel
          .send(embed)
          .then((postMessage) => {
            const reactions = process.env.WELCOME_USER_MESSAGE_REACTIONS_ID;
            if (!reactions) {
              return;
            }

            const reactionIds = reactions.split('|');

            if (!reactionIds || reactionIds.length === 0) {
              return;
            }

            reactionIds.forEach((react) => {
              if (react.length <= 2) {
                postMessage.react(`${react}`);
              } else {
                const customReactExists = postMessage.guild.emojis.find(
                  (e) => e.name === react
                );
                if (customReactExists) {
                  postMessage.react(customReactExists).catch(console.error);
                }
              }
            });
          })
          .catch(console.error);
      }
    }, 1000);
  });

  client.on('guildMemberRemove', (member) => {
    if (process.env.ENABLED_ADMINISTRATION === 'true') {
      setTimeout(() => {
        const data = {
          _id: new Date(),
          userName: member.nickname || member.user.username,
          userID: member.user.tag,
          date: new Date(),
        };
        mongoConnection.saveOrUpdate(logName, data, 'userLeft', () => {});
      }, 1000);
    }
  });
};

module.exports = exports;
