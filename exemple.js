const { Client, GatewayIntentBits } = require('discord.js');
const Starboard = require('discord-starboard-plus'); //Import module

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

// Module options for the Starboard
const starboardOptions = {
  starboardChannelID: '3737337383643743894283', // Replace with the starboard channel ID
  requiredReactions: 1, // Number of required reactions
  // Other options...
};

// Listen to the "ready" event of the Discord client and create an instance of the Starboard module
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const starboard = new Starboard(client, starboardOptions);
});

// Log in the bot using your bot's token
client.login(process.env.token);
