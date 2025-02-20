const { Client, GatewayIntentBits } = require('discord.js');
const Starboard = require('discord-starboard-plus'); // Import module or use the local version : const Starboard = require('./src/starboard');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const starboardOptions = {
  starboardChannelID: '1342121819100020749', // Replace with the starboard channel ID
  requiredReactions: 1, // Number of required reactions
  // Other options...
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const starboard = new Starboard(client, starboardOptions);
});

// Log in the bot using your bot's token
client.login("YOUR_BOT_TOKEN");
