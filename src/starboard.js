class Starboard {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
    this.starEmoji = options.starEmoji || '⭐';
    this.starboardChannelID = options.starboardChannelID || null;
    this.requiredReactions = options.requiredReactions || 1;
    this.ignoreBots = options.ignoreBots || true;
    this.ignoreSelf = options.ignoreSelf || false;
    this.ignoredChannels = options.ignoredChannels || [];
    this.updateOnReaction = options.updateOnReaction || true;
    this.logActions = options.logActions !== undefined ? options.logActions : true;
    this.ignoreGuilds = options.ignoreGuilds || []; // Soon

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

      if (this.ignoreBots === true && user.bot) {
        return;
      }
    
      if (this.ignoreSelf === true && reaction.message.author.id === user.id) {
        return; 
      }
    

      if (reaction.emoji.name === this.starEmoji) {
        try {
          const message = reaction.message;
          const server = message.guild;

          if (this.ignoredChannels && (this.ignoredChannels.length === 0 || !this.ignoredChannels.includes(message.channel.id))) {
            const starboardChannel = server.channels.cache.get(this.starboardChannelID);

            if (!starboardChannel) {
              this.log('❌', `Error: Starboard channel not found.`);
              return;
            }
            if (reaction.count >= this.requiredReactions) {
              if (message.author.bot) {
                return;
              }
            
              try {
                const existingStarboardMessages = await starboardChannel.messages.fetch({ limit: 100 });
            
                if (!existingStarboardMessages) {

                  this.log('❌', `Error: Messages not fetched`);
                  return;

                }
            
                const existingStarboardMessage = existingStarboardMessages.find(msg => {
                  const embed = msg.embeds && msg.embeds[0];
            
                  if (!embed) {
                    return false;
                  }
            
                  const embedSource = embed?.fields?.[0]?.value;
                  return embedSource === `[Go to message](${message.url})`;
                });
            
                const starEmbed = await this.createStarredEmbed(message, user);
            
                if (!existingStarboardMessage) {
                  this.sendStarboardMessage(starboardChannel, starEmbed);
                } else if (this.updateOnReaction) {
                  const users = await reaction.users.fetch();
                  const realReactionCount = users.filter(user => !user.bot).size;
                  let existingContent = existingStarboardMessage.content;
                  existingContent = existingContent.replace(/💫 \*\*\d+\*\*/, `💫 **${realReactionCount}**`);
                  existingStarboardMessage.edit(existingContent);
                }
              } catch (error) {
                this.log('❌', `Error fetching messages: ${error}`);

              }
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

  // Create embed

  async createStarredEmbed(message, user) {
    let embedDescription = message.content;
    const reactions = message.reactions.cache;
    let reactionCount = 0;

reactions.forEach((reaction) => {
  const count = this.ignoreSelf ? reaction.count - 1 : reaction.count;
  reactionCount += count;
});

    const channelMention = `<#${message.channel.id}>`;
    const content = `💫 **${reactionCount}** ${channelMention}`;

    const embed = {
      color: 0xFFAC33,
      author: {
        name: message.author.tag, 
        icon_url: message.author.displayAvatarURL({ dynamic: true }),
      },
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Source',
          value: `[Go to message](${message.url})`,
        },
      ],
    };

    const videoAttachment = message.attachments.find(attachment => attachment.contentType.startsWith('video'));

    if (videoAttachment) {
      embedDescription += `\n\n${videoAttachment.url}`;
    }

    if(embedDescription) {
      embed.description = embedDescription;
    }

    const image = message.attachments.first();

    if (image) {
      embed.image = { url: image.url };
    }
  
    return {
      embed,
      content
    }}
  
 
  // Send embed
  async sendStarboardMessage(starboardChannel, data) {
    // Check if the embed and its description are not empty
    const { embed, content } = data;

    if ((embed && embed.description && embed.description.trim() !== "") || (embed && embed.image)) {
      const starboardMessage = await starboardChannel.send({content: content, embeds: [embed] });
      this.log('ℹ️', 'Message pinned successfully!');
    } else {
      this.log('❌', `Error: Embed is empty or missing description; nothing to send.`);
    }
  }
  
  
}

module.exports = Starboard;
