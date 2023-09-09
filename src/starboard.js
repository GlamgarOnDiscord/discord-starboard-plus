class Starboard {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
    this.starEmoji = options.starEmoji || '⭐';
    this.starboardChannelID = options.starboardChannelID || null;
    this.requiredReactions = options.requiredReactions || 1;
    this.customMessage = options.customMessage || null;
    this.ignoreBots = options.ignoreBots || true;
    this.ignoreSelf = options.ignoreSelf || true;
    this.ignoreList = options.ignoreList || [];
    this.ignoredChannels = options.ignoredChannels || [];
    this.updateOnReaction = options.updateOnReaction || true;
    this.timestampFormat = options.timestampFormat || 'LLLL';
    this.logActions = options.logActions !== undefined ? options.logActions : true;
    this.ignoreGuilds = options.ignoreGuilds || [];

    if (!this.starboardChannelID) {
      throw new Error('starboardChannelID is required.');
    }

    this.log = (emoji, message) => {
      if (this.logActions) {
        console.log(`[ ${emoji} ] ${message}`);
      }
    };

    this.log('⭐', 'Starboard system is active!');

    this.client.on('messageReactionAdd', async (reaction, user) => {
      if ((this.ignoreBots && user.bot) || (this.ignoreSelf && user.id === this.client.user.id)) {
        return;
      }

      if (reaction.emoji.name === this.starEmoji && user.id !== this.client.user.id) {
        try {
          const message = reaction.message;
          const server = message.guild;

          if (this.ignoredChannels && (this.ignoredChannels.length === 0 || !this.ignoredChannels.includes(message.channel.id))) {
            const starboardChannel = server.channels.cache.get(this.starboardChannelID);

            if (starboardChannel) {
              if (reaction.count >= this.requiredReactions) {
                let content = message.content;
                let image = message.attachments.first();

                const existingStarboardMessages = await starboardChannel.messages.fetch({ limit: 100 });

                if (!existingStarboardMessages) {
                  console.log("Messages not fetched");
                  return;
                }

                const existingStarboardMessage = existingStarboardMessages.find(msg => {
                  const embed = msg.embeds && msg.embeds[0];

                  if (!embed) {
                    return false;
                  }

                  return (embed.description && embed.description.includes(message.url)) ||
                    (embed.image && embed.image.url === image?.url);
                });

                if (!existingStarboardMessage) {
                  const starboardMessage = await starboardChannel.send(content, {
                    embed: {
                      description: `**Starred by ${user.tag}**\n${content}`,
                      image: image ? { url: image.url } : null
                    }
                  });

                  await starboardMessage.react(this.starEmoji);

                  this.log('ℹ️', 'Message pinned successfully!');
                } else if (this.updateOnReaction) {
                  await existingStarboardMessage.edit(content, {
                    embed: {
                      description: `**Starred by ${user.tag}**\n${content}`,
                      image: image ? { url: image.url } : null
                    }
                  });

                  this.log('ℹ️', 'Pinned message updated successfully!');
                }
              }
            } else {
              throw new Error('Starboard channel not found.');
            }
          } else {
            throw new Error('Server not found or ignored by configuration.');
          }
        } catch (error) {
          this.log('❌', `Error: ${error.message}`);
        }
      }
    });
  }
}

module.exports = Starboard;
