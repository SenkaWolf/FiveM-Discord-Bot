var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var SVR = "https://api.trackyserver.com/widget/index.php?id=2203975";
// Add your FiveM server to trackyserver.com then from your server pages URL take the numbers and replace them after the = on the above line.


client.once('ready', () => {
    console.log('Status Bot Loaded');
    updateStatus();
    setInterval(function() {
       updateStatus();
    },60000);
});

client.on('message', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if(command === 'st' || command === "status") {
        var datetime = new Date().toLocaleString(); 

        var server = await getJSON(SVR); 
        var playercount = server.playerscount;

        var status = 'Online';
        if(playercount === "offline") {
            status = 'Offline';
            playercount = 'Offline';
        } else {
            status = 'Online';
        }

        const embed = new MessageEmbed()
            .setColor('d63384')
            .setTitle('Discord Bot Tile')
            .setURL('https://example.com')
            .setThumbnail('https://example.com/assets/logo.png')
            .addFields(
                    { name: 'Website\n https://example.com', value: '\u200b', inline: false },
                    { name: 'Status', value: '```'+status+'```', inline: true },
                    { name: 'Players', value: '```'+playercount+'```', inline: true },
                    { name: 'Server IP', value: "cfx.re/join/", inline: false },
                    { name: '\u200b', value: "[Connect to Server](https://cfx.re/join/ 'Connect to Server')", inline: false }
                    
                )
            .setFooter('Last Updated: '+datetime);
            
            message.channel.send(embed);
        message.delete();     
    }
});

async function getJSON(url) {
    var resp ;
    var xmlHttp ;

    resp  = '' ;
    xmlHttp = new XMLHttpRequest();

    if(xmlHttp != null)
    {
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
    }

    return JSON.parse(resp);
}


async function updateStatus() {
    client.guilds.cache.get(GUILD_ID).channels.cache.get(STATUS_CHANNEL).messages.fetch(STATUS_MESSAGE).then(async function(msg) {
        
        var datetime = new Date().toLocaleString(); 

        var server = await getJSON(SVR); 
        var playercount = server.playerscount;

        var status = 'Online';
        if(playercount === "offline") {
            status = 'Offline';
            playercount = 'Offline';
        } else {
            status = 'Online';
        }

        const embed = new MessageEmbed()
            .setColor('d63384')
            .setTitle('Discord Bot Tile')
            .setURL('https://example.com')
            .setThumbnail('https://example.com/assets/logo.png')
            .addFields(
                    { name: 'Website\n https://example.com', value: '\u200b', inline: false },
                    { name: 'Status', value: '```'+status+'```', inline: true },
                    { name: 'Players', value: '```'+playercount+'```', inline: true },
                    { name: 'Server IP', value: "cfx.re/join/", inline: false },
                    { name: '\u200b', value: "[Connect to Server](https://cfx.re/join/ 'Connect to Server')", inline: false }
                    
                )
            .setFooter('Last Updated: '+datetime);
        msg.edit(embed);
    });
}