# What's CW discord bot?

It's a support bot to about ~2k [Elite: Dangerous](https://www.elitedangerous.com/) players on [Discord communication software](https://discordapp.com/).

Linked to 3rd party APIs, eddb.io and edsm.net.

CW are initials to ["Cobra Wing"](http://elitedangerouscobra.com.br/) our private group in the game Elite: Dangerous.

#
# What's your features and commands?

##### Commands to Show:
#

> System that CW there's placed and your reputations;
> Chart by all systems and compare that CW there's placed and your reputations day by day;
> System minor groups to compare your influences;
> Help command to show available commands;
> Players statistics online and what's games who playing.

##### Custom Commands:
#

> Admin manager custom commands to returns a specific and static message response;
> List all custom commands by group type.

##### Scheduled Execution:
#

>Monitor and advertise newsletter by game developer site;
>Monitor and advertise game server status (online, offline);
>Extraction 3rd party sites infos to show chart statistics.
#
#
# Technologies used:

>Made using Node.js with discord.js dependency to connect the Discord server;
>Many npm dependencies to read local files, request/response APIs, text format, data base access and others;
>Jobs execution using node.js;
>Plot.ly javascript API to generate charts;
>Mongo database to store informations;
>[Heroku](https://www.heroku.com) cloud application platform to run.

#
# Steps to Run:

##### 1) configure environment variables in your system or create .env file with:
#

>**ENVIRONMENT** => set to DEV on localhost
>**BASE_URL** => Site base URL (local http://localhost:5000 with default port)
>**BOT_KEY** => DiscordJs bot public key, see more in discordapp.com/developers
>**MONGO_URL** => mongodb://user:pass@host:port/dbaseName
>**PLOTLY_USER** => Plotly API user
>**PLOTLY_PASS** => Plotly API password
>**NEWSLETTER_CHANNEL** => Discord channel name to show newsletter notification
>**SERVER_STATUS_CHANNEL** => Discord channel name to show server status change notification
>**CUSTOM_COMMANDS_CHANNEL** => Discord channel name to execute custom commands (admin commands)
>**BLOCK_BOT_DIRECT_MESSAGES** => (true|false) to bot ignore direct messages.

##### 2) Install node modules dependencies:
#
>**npm install**

##### 3) Execute bot:
#
>**npm start**

#
# Screenshots

![](https://i.imgur.com/lvMzPxn.png)
![](https://i.imgur.com/CCeVJSQ.png)
![](https://i.imgur.com/LchOy8X.png)
![](https://imgur.com/Bq4s0A6.png)
![](https://imgur.com/f1kUnhq.png)
![](https://imgur.com/sACws05.png)
![](https://imgur.com/VidCu9j.png)
![](https://imgur.com/l67BtEv.png)