client.once('ready', async () => {
    console.log('Member Count Bot Loaded');
	await updateMembers();
    setInterval(function() {
        updateMembers();
     },60000);
	
});

client.on('guildMemberAdd', async (member) => {
    await updateMembers();
});

client.on('guildMemberRemove', async (member) => {
    await updateMembers();
});

async function updateMembers() {
    await client.guilds.cache.get(GUILD_ID).channels.cache.find(channel => channel.id ===  MEMBER_COUNT).setName(`Player: ${await client.guilds.cache.get(GUILD_ID).memberCount.toLocaleString()}`);
}