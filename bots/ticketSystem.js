const discord = require('discord.js');
const moment = require('moment');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM();
const document = dom.window.document;
const fsp = require('fs').promises;

const activeTicket = new Set();
const activeAppeal = new Set();

client.once('ready', () => {
    console.log('Ticket Bot has Loaded');
	client.user.setPresence({
        status: 'available',
        activity: {
            name: 'Support Bot!',
            type: 'PLAYING'
        }
    });
});


client.on('channelDelete', async channel => {
    var parentID = await channel.parentID;
    if( parentID === TICKET_CATEGORY) {
        var cName = await channel.name;
        var discordID_Ticket = await getTicketDiscordID(cName);


        const fetchedLogs = await client.guilds.cache.get(GUILD_ID).fetchAuditLogs({
            limit: 1,
            type: 'CHANNEL_DELETE',
        });
        const deletionLog = fetchedLogs.entries.first();

        if (!deletionLog) return console.log(`Channel: ID ${channel.id} | ${channel.name} was deleted, but no relevant audit logs were found.`);

        const { executor, target } = deletionLog;

        if (target.id === channel.id) {
            if(executor.bot === true) return;
            var embed11 = new MessageEmbed()
                .setColor('0xFF0000')
                .setTitle('Discord Bot Tile')
                .setURL('https://example.com')
                .setThumbnail('https://example.com/assets/logo.png')
                .addFields(
                        { name: 'Ticket: '+cName, value: 'Transcript: <@'+discordID_Ticket+'>\nError: The channel was deleted, transcript could not be saved!', inline: false}
                );
                await client.guilds.cache.get(GUILD_ID).channels.cache.get(TICKET_TRANSCRIPT_CHANNEL).send(embed11);

                const embed3 = new MessageEmbed()
                    .setColor('5ab0f9')
                    .setAuthor("Channel Deleted!")
                    .addFields(
                            { name: 'Ticket ID:', value: cName, inline: false },
                            { name: 'Action:', value: "Deleted by <@"+await executor.id+">", inline: false }
                        );            
                await client.guilds.cache.get(GUILD_ID).channels.cache.find(channel => channel.id ===  TICKET_LOG_CHANNEL).send(embed3);
            
        }
        if(cName.includes("ticket")) {
            activeTicket.delete(discordID_Ticket);
        } else {
            activeAppeal.delete(discordID_Ticket);
        }
    }
});


client.on('message', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if(command === 'tm') {
        if(await message.member.roles.cache.some(role => role.name === ADMIN_ROLE)) {
            const embed = new MessageEmbed()
            .setColor('d63384')
            .setTitle('Discord Bot Tile')
            .setURL('https://example.com')
            .setThumbnail('https://example.com/assets/logo.png')
            .addFields(
                    { name: 'Support', value: '\u200b', inline: false },
                    { name: 'Support', value: 'To create a support ticket react with 🎟️', inline: false },
                    { name: 'Ban Appeals', value: 'To appeal a ban react with 🔨', inline: false }                    
                );
            
            message.channel.send(embed).then(m => {
                m.react('🎟️')
                .then(m.react('🔨'))
            });
            
            message.delete();
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    var cChannel = reaction.message.channel.id;

    if(reaction.message.channel.parentID === TICKET_CATEGORY || reaction.message.channel.id === TICKET_CHANNEL) {
    var cName = reaction.message.channel.name;
    var e = reaction.emoji.name;
    var e_id = reaction.emoji.id;
    var uID = user.id;
    var guild = client.guilds.cache.get(GUILD_ID);

    
    var userCreated = await user.createdAt;
    var userJoined = null;
    if(await reaction.client.guilds.cache.get(GUILD_ID).member(uID).joinedAt) {
        userJoined = await reaction.client.guilds.cache.get(GUILD_ID).member(uID).joinedAt;
    }
    var avatar = await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.avatar;
    var dateUV1 = new Date(userJoined).toDateString();
    var dateJoined = moment(formatDate(dateUV1), "YYYYMMDD").fromNow();
    var dateUV = new Date(userCreated).toDateString();
    var dateCreated = moment(formatDate(dateUV), "YYYYMMDD").fromNow();
    var count = await totalLogs()+1;
    var ticketName = null;
    var ticketType = null;
    var userNickname = await reaction.client.guilds.cache.get(GUILD_ID).member(uID).nickname;
    
    if(userNickname === null) {
        userNickname = await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.username + '#' + await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.discriminator;
    }
    if(cName.includes("ticket-0")) return;

        if(cChannel === TICKET_CHANNEL) {
            if(e === "🔨" || e === "🎟️") {
                await reaction.users.remove(uID);
                if(user.bot) return;

                if(e === "🎟️") {
                    if(activeTicket.has(uID)) return;
                    ticketType = 2;
                    ticketName = "ticket-"+count;
                } else if(e === "🔨") {
                    if(activeAppeal.has(uID)) return;
                    ticketType = 1;
                    ticketName = "appeal-"+count;
                }

                
            
                await client.guilds.cache.get(GUILD_ID).channels.create(ticketName, {
                    type: 'text',
                    parent: TICKET_CATEGORY,
                    permissionOverwrites: [
                            {
                                id: client.guilds.cache.get(GUILD_ID).roles.cache.find(role => role.name === 'Support').id,
                                allow: ['VIEW_CHANNEL','SEND_MESSAGES','ATTACH_FILES'],
                            },
                            {
                                id: uID,
                                allow: ['VIEW_CHANNEL','SEND_MESSAGES','ATTACH_FILES'],
                            },
                            {
                                id: client.guilds.cache.get(GUILD_ID).roles.cache.find(role => role.name === '@everyone').id,
                                deny: ['VIEW_CHANNEL']
                            }
                        ],
                }).then(channel => {

                    const embed = new MessageEmbed()
                        .setColor('0x74ee15')
                        .setTitle('Discord Bot Tile')
                        .setURL('https://example.com')
                        .setThumbnail('https://example.com/assets/logo.png')
                        .addFields(
                                { name: 'Support', value: 'New Ticket has been submitted by <@'+uID+'>!', inline: false },
                                { name: '\u200b', value: 'Nickname: ```'+userNickname+'```', inline: true},
                                { name: '\u200b', value: 'ID: ```'+uID+'```', inline: true},
                                { name: '\u200b', value: '\u200b', inline: true},
                                { name: '\u200b', value: '\nAccount Age: ```'+dateCreated+'```', inline: true},
                                { name: '\u200b', value: 'Joined: ```'+dateJoined+'```', inline: true},
                                { name: '\u200b', value: "A member of support will be with you shortly!\nTo close your ticket react with 🔒", inline: false}
                            );
                        
                    channel.send(embed).then(m => {
                        m.react('🔒')
                    });
                });
        

                const embed2 = new MessageEmbed()
                    .setColor('0x74ee15')
                    .setAuthor(await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.username + '#' + await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.discriminator, "https://cdn.discordapp.com/avatars/"+uID+"/"+avatar+".png")
                    .addFields(
                            { name: 'Ticket ID:', value: ticketName, inline: false },
                            { name: 'Action:', value: "Opened by <@"+uID+">", inline: false }
                        );            
                await client.guilds.cache.get(GUILD_ID).channels.cache.find(channel => channel.id ===  TICKET_LOG_CHANNEL).send(embed2);

                await logTicket(ticketName,uID,ticketType);

                
            }
        }

        if(e === "❌") {
            if(cName.includes("ticket") || cName.includes("appeal")) {
                if(user.bot) return;
                reaction.message.reactions.removeAll();
                await reaction.message.react("🔒");
                await reaction.users.remove(uID);
            }
        }

        if(e === "✅") {
            if(cName.includes("ticket") || cName.includes("appeal")) {
                if(user.bot) return;
                var embed1 = new MessageEmbed()
                    .setColor('0xFF8000')
                    .setTitle('Discord Bot Tile')
                    .setURL('https://example.com')
                    .setThumbnail('https://example.com/assets/logo.png')
                    .addFields(
                        { name: '\u200b', value: 'The ticket has now been closed by <@'+uID+'>!', inline: true},

                    );
                    
                await client.guilds.cache.get(GUILD_ID).channels.cache.get(cChannel).send(embed1);

                setTimeout(() => {
                    var embed2 = new MessageEmbed()
                        .setColor('0xFF0000')
                        .setTitle('Discord Bot Tile')
                        .setURL('https://example.com')
                        .setThumbnail('https://example.com/assets/logo.png')
                        .addFields(
                                { name: '\u200b', value: '⛔ - Close Ticket Confirmation (Staff Only)', inline: false}
                        );
                        client.guilds.cache.get(GUILD_ID).channels.cache.get(cChannel).send(embed2).then(m => {
                            m.react('⛔')
                        });
                },1000);
                
                await reaction.users.remove(uID);
            }
        }

        if(e === "⛔") {
            if(cName.includes("ticket") || cName.includes("appeal")) {
                var discordID_Ticket = await getTicketDiscordID(cName)
                var transcriptFile = `./tickets/logs/${discordID_Ticket}/${cName}/index.html`; 
                var locationTranscript = `./tickets/logs/${discordID_Ticket}`;
            
                if(!fs.existsSync(locationTranscript)) {
                    fs.mkdir(locationTranscript, { recursive: true}, function (err) {
                        if(err) throw err;
                    });
                }
                if(user.bot) return;
                /*****************************/
                /*    GENERATE TRANSCRIPT    */
                /*****************************/
                let channelMessages = await client.guilds.cache.get(GUILD_ID).channels.cache.get(cChannel).messages.fetch({
                    limit: 100
                }).catch(err => console.log(err));
                let messageCollection = new Collection();
                messageCollection = messageCollection.concat(channelMessages);
        
                while(channelMessages.size === 100) {
                    let lastMessageId = channelMessages.lastKey();
                    channelMessages = await message.channel.messages.fetch({ limit: 100, before: lastMessageId }).catch(err => console.log(err));
                    if(channelMessages)
                        messageCollection = messageCollection.concat(channelMessages);
                }
                let msgs = messageCollection.array().reverse();
                let data = await fsp.readFile('./tickets/template.html', 'utf8').catch(err => console.log(err));
                if(data) {
                    await fsp.writeFile(transcriptFile, data).catch(err => console.log(err));
                    let guildElement = document.createElement('div');
                    let guildText = document.createTextNode(await client.guilds.cache.get(GUILD_ID).name);
                    let guildImg = document.createElement('img');
                    guildImg.setAttribute('src', "https://cdn.discordapp.com/icons/"+GUILD_ID+"/"+await client.guilds.cache.get(GUILD_ID).icon+".png");
                    guildImg.setAttribute('width', '150');
                    guildElement.appendChild(guildImg);
                    guildElement.appendChild(guildText);
                    await fsp.appendFile(transcriptFile, guildElement.outerHTML).catch(err => console.log(err));
        
                    msgs.forEach(async msg => {
                        let parentContainer = document.createElement("div");
                        parentContainer.className = "parent-container";
        
                        let avatarDiv = document.createElement("div");
                        avatarDiv.className = "avatar-container";
                        let img = document.createElement('img');
                        if(msg.author.avatar === null) {
                            img.setAttribute('src', "https://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png");
                        } else {
                            img.setAttribute('src', "https://cdn.discordapp.com/avatars/"+msg.author.id+"/"+msg.author.avatar+".png");
                        }
                        img.className = "avatar";
                        avatarDiv.appendChild(img);
        
                        parentContainer.appendChild(avatarDiv);
        
                        let messageContainer = document.createElement('div');
                        messageContainer.className = "message-container";
        
                        let nameElement = document.createElement("span");
                        let name = document.createTextNode(msg.author.tag + " " + msg.createdAt.toDateString() + " " + msg.createdAt.toLocaleTimeString() + " BST");
                        nameElement.id = "title";
                        nameElement.appendChild(name);
                        messageContainer.append(nameElement);
                        var checkAttachment = await msg.attachments.size;
                        var fileAttached = await msg.attachments;
                        var message_format = null;
                        if( checkAttachment > 0) {
                            var Attachment = (fileAttached).array();
                            Attachment.forEach(function(attachment) {
                                message_format = attachment.url;
                            });
                            let msgNode = document.createElement('span');
                            let textNode = document.createTextNode(message_format);
                            msgNode.append(textNode);
                            messageContainer.appendChild(msgNode);
                        } else {
                            if(msg.content.startsWith("```")) {
                                let m = msg.content.replace(/```/g, "");
                                let codeNode = document.createElement("code");
                                let textNode =  document.createTextNode(m);
                                codeNode.appendChild(textNode);
                                messageContainer.appendChild(codeNode);
                            }
                            else {
                                let msgNode = document.createElement('span');
                                let textNode = document.createTextNode(msg.content);
                                msgNode.append(textNode);
                                messageContainer.appendChild(msgNode);
                            }
                        }
                        parentContainer.appendChild(messageContainer);
                        await fsp.appendFile(transcriptFile, parentContainer.outerHTML).catch(err => console.log(err));
                    });
                }

                var embed11 = new MessageEmbed()
                    .setColor('0xFF0000')
                    .setTitle('Discord Bot Tile')
                    .setURL('https://example.com')
                    .setThumbnail('https://example.com/assets/logo.png')
                    .addFields(
                            { name: 'Ticket: '+cName, value: 'Transcript: <@'+discordID_Ticket+'>', inline: false}
                    );
                await client.guilds.cache.get(GUILD_ID).channels.cache.get(TICKET_TRANSCRIPT_CHANNEL).send(embed11);
                await client.guilds.cache.get(GUILD_ID).channels.cache.get(TICKET_TRANSCRIPT_CHANNEL).send({files:[transcriptFile]});

                /************************/
                var embed5 = new MessageEmbed()
                    .setColor('0xFF0000')
                    .setTitle('Discord Bot Tile')
                    .setURL('https://example.com')
                    .setThumbnail('https://example.com/assets/logo.png')
                    .addFields(
                            { name: 'Ticket: CLOSED', value: '⛔ - Deleting the ticket in 5 seconds...', inline: false}
                    );
                await client.guilds.cache.get(GUILD_ID).channels.cache.get(cChannel).send(embed5);

                setTimeout(() => {
                    client.guilds.cache.get(GUILD_ID).channels.cache.get(cChannel).delete();
                },5000);

                const embed3 = new MessageEmbed()
                    .setColor('5ab0f9')
                    .setAuthor(await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.username + '#' + await reaction.client.guilds.cache.get(GUILD_ID).member(uID).user.discriminator, "https://cdn.discordapp.com/avatars/"+uID+"/"+avatar+".png")
                    .addFields(
                            { name: 'Ticket ID:', value: cName, inline: false },
                            { name: 'Action:', value: "Closed by <@"+uID+">", inline: false }
                        );            
                await client.guilds.cache.get(GUILD_ID).channels.cache.find(channel => channel.id ===  TICKET_LOG_CHANNEL).send(embed3);

                if(cName.includes("ticket")) {
                    activeTicket.delete(discordID_Ticket);
                } else {
                    activeAppeal.delete(discordID_Ticket);
                }

            }
        }
        if(e === "🔒") {
            if(cName.includes("ticket") || cName.includes("appeal")) {
                if(user.bot) return;
                await reaction.users.remove(uID);
                reaction.message.react("❌");
                reaction.message.react("✅");
            }
        }
    }
});

async function totalLogs() {
    var location = './tickets/misc';
    if(fs.existsSync(location)) {
        var file = fs.readdirSync(location).length;
        return file;
    } else {
        return '0';
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('');
}

async function getTicketDiscordID(ticket) {
    var activeFile = `./tickets/misc/${ticket}.fivem`;
    if(fs.existsSync(activeFile)) {
        var DiscordID = fs.readFileSync(activeFile, 'utf8');
        return DiscordID;
    }
}

async function logTicket(name,id,type) {  
    var file = `./tickets/misc/${name}.fivem`;
    var location = `./tickets/misc`;
    
    var logLocation = `./tickets/logs/${id}/${name}`;

    if(!fs.existsSync(logLocation)) { 
        await fs.mkdir(logLocation, { recursive: true}, function (err) {
            if(err) throw err;
        });
    }
    if(!fs.existsSync(location)) { 
        await fs.mkdir(location, { recursive: true}, function (err) {
            if(err) throw err;
        });
        await fs.appendFile(file, id, function (err) {
            if (err) throw err;
        });
    } else { 
        await fs.appendFile(file, id, function (err) {
            if (err) throw err;
        });  
    }

    if(type === 2) {
        activeTicket.add(id);
    } else {
        activeAppeal.add(id);
    }
    
    
}