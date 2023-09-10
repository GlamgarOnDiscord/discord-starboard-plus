# ⭐ Discord Starboard Plus

[![Discord Server](https://dcbadge.vercel.app/api/server/cG3SxzK3Vp)](https://discord.gg/cG3SxzK3Vp)
[![npm version](https://img.shields.io/npm/v/discord-starboard-plus.svg?style=flat-square)](https://www.npmjs.com/package/discord-starboard-plus)
[![npm downloads](https://img.shields.io/npm/dm/discord-starboard-plus.svg?style=flat-square)](https://www.npmjs.com/package/discord-starboard-plus)
[![GitHub license](https://img.shields.io/github/license/GlamgarOnDiscord/discord-starboard-plus.svg?style=flat-square)](https://github.com/GlamgarOnDiscord/discord-starboard-plus/blob/master/LICENSE)



> Effortlessly highlight your community's favorite messages with customizable starboards. Pin and celebrate standout content, tailor reaction requirements, add personalized messages, and enjoy detailed logging. Showcase your server's best moments and engage with members like never before. Turn your Discord server into a star-studded community with Starboard Plus!

## 🪐 Table of Contents
- 📑 [Overview](#📑-overview)
- 🚀 [Features](#🚀-features)
- 🏗️ [Project Structure](#🏗️-project-structure)
- 🧩 [Modules](#🧩-modules)
- 🛠️ [Getting Started](#🛠️-getting-started)
  - 🔌 [Prerequisites](#🔌-prerequisites)
  - ⬇️ [Installation](#⬇️-installation)
- 📖 [Usage](#📖-usage)
- 🧪 [Running Tests](#🧪-running-tests)
- ⚡ [To-do](#⚡-to-do)
- 🤝 [Contributing](#🤝-contributing)
- 📄 [License](#📄-license)
- 👏 [Credits](#👏-credits)


## 📑 Overview
The Discord Starboard Plus is a powerful and customizable Discord bot module that allows you to create starboards for your server. Whether you want to highlight memorable messages, pin important content, or engage with your community, Starboard Plus has got you covered. With features like customizable star emojis, reaction requirements, personalized messages, and detailed logging, you can easily turn your server into a star-studded community.


## 🚀 Features
- **Customizable Starboards:** Create multiple starboards with different settings to highlight various types of content.
- **Reaction Requirements:** Set the number of reactions required for a message to appear on the starboard.
- **Personalized Messages:** Add custom messages to your starboard entries to engage with your community.
- **Logging:** Detailed logging options to keep track of starred messages and bot actions.
- **Ignore Configuration:** Configure which channels or guilds to ignore when monitoring reactions.

## 🏗️ Project Structure
Your package directory structure should resemble the following:

```bash
discord-starboard-plus/
├── src/
│ ├── starboard.js
├── exemple.js
├── package.json
└── README.md
```

## 🧩 Modules
- `starboard.js`: The main module containing the Starboard class and logic for managing starboards.

## 🛠️ Getting Started

### 🔌 Prerequisites
Before you begin, ensure you have the following prerequisites:
- Node.js installed on your machine.

### ⬇️ Installation
1. Install the `discord-starboard-plus` package using npm:

```sh
npm install discord-starboard-plus
```

### 📖 Usage
To use Discord Starboard Plus in your bot, you need to create an instance of the Starboard class and pass the necessary options.

```js
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

const starboardOptions = {
  starboardChannelID: 'YOUR_STARBOARD_CHANNEL_ID',
  requiredReactions: 1,
  starEmoji: 'STAR_EMOJI' // Default : '⭐'
  // Add other options as needed
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const starboard = new Starboard(client, starboardOptions);
});

client.login('YOUR_BOT_TOKEN');
```

### 🧪 Running Tests
Tests for Discord Starboard Plus can be run using a testing framework like Mocha or Jest. Make sure to set up appropriate testing scenarios and assertions for your specific use case.

## ⚡ TO-DO 

- [x] Add custom options.
- [x] Create README.
- [x] Add starboard with image and new options.
- [x] Add new embed message.
- [ ] Patch configurations.
- [ ] Patch edit embed message.

## 🤝 Contributing

Contributions are welcome! If you have any ideas, bug reports, or feature requests, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Credits

> All rights to this project are owned and all created by glamgar.

