/*	Discord Bot	*/

const { 
    TOKEN, 
    PREFIX,
    GUILD_ID,
    TICKET_CATEGORY,
    TICKET_CHANNEL,
    TICKET_LOG_CHANNEL,
    TICKET_TRANSCRIPT_CHANNEL,
    MEMBER_COUNT,
    SUPPORT_ROLE,
    ADMIN_ROLE,
    STATUS_CHANNEL,
    STATUS_MESSAGE
} = require('./config/config.json');

const { Client, MessageEmbed, Collection } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'EMOJI'] });

const fs = require('fs');

eval(fs.readFileSync('./bots/serverStatus.js')+''); 
eval(fs.readFileSync('./bots/ticketSystem.js')+''); 
eval(fs.readFileSync('./bots/giveawayRole.js')+''); 
eval(fs.readFileSync('./bots/memberCount.js')+''); 

client.login(TOKEN);