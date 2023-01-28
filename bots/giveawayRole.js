client.once('ready', () => {
    console.log('Giveaway Bot Loaded');
});

client.on('message', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if(command === 'giveaway') {
        if(await message.member.roles.cache.some(role => role.name === ADMIN_ROLE)) {
            var roleID = null;
            if (!args.length || isNaN(args)) {
                return message.channel.send('Invalid Command: !giveaway [Role ID]');
            } else {
                roleID = await args;
            }
            var list = client.guilds.cache.get(GUILD_ID);
            var chosen = [];

            await message.guild.members.cache.filter(member => member.roles.cache.find(role => role.id == roleID)).map(member => chosen.push(member.user.id));

            if(chosen !== "undefined" && chosen !== "null" && chosen.length > 0) {
                await message.channel.send(`<@${message.author.id}> has ran a giveaway for group: <@&${roleID}>`);
                const embed = new MessageEmbed()
                .setColor('d63384')
                .setTitle('Discord Bot Tile')
                .setURL('https://example.com')
                .setThumbnail('https://example.com/assets/logo.png')
                .addFields(
                        { name: 'Giveaway', value: ` Congratulations <@${chosen[Math.floor(Math.random() * chosen.length)]}>`, inline: false}                
                    );
                await message.channel.send(embed);
            }
            message.delete();
        }
    }
});
