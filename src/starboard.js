/**
 * Starboard system for Discord.js
 * @param {Discord.Client} client - Discord client
 * @param {Object} options - Configuration options
 */
class Starboard {
  constructor(client, options = {}) {
    if (!client) throw new Error('Discord client is required');
    if (!options.starboardChannelID) throw new Error('starboardChannelID is required');

    this.client = client;
    this.validateAndSetOptions(options);
    this.initializeEventListeners();
  }

    /**
   * Valide et définit les options de configuration pour le système de starboard.
   *
   * @param {Object} options - Les options de configuration fournies par l'utilisateur.
   * @param {string} [options.starEmoji='⭐'] - L'emoji utilisé pour marquer un message.
   * @param {string} options.starboardChannelID - L'ID du canal où seront envoyés les messages étoilés.
   * @param {number} [options.requiredReactions=1] - Le nombre minimal de réactions nécessaires pour épingler un message.
   * @param {boolean} [options.ignoreBots=true] - Indique si les messages des bots doivent être ignorés.
   * @param {boolean} [options.ignoreSelf=false] - Indique si l'utilisateur peut étoiler ses propres messages.
   * @param {string[]} [options.ignoredChannels=[]] - Liste des ID de canaux à ignorer.
   * @param {string[]} [options.ignoreGuilds=[]] - Liste des ID de serveurs (guildes) à ignorer.
   * @param {boolean} [options.updateOnReaction=true] - Indique si le message étoilé doit être mis à jour à chaque réaction.
   * @param {boolean} [options.logActions=true] - Active ou désactive la journalisation des actions.
   * @param {number} [options.embedColor=0xFFAC33] - Couleur de l'embed affichant les messages étoilés.
   * @param {number} [options.maxAttachments=4] - Nombre maximal de pièces jointes affichées dans l'embed.
   * @param {boolean} [options.allowNSFW=false] - Permet ou non d'épingler des messages NSFW.
   * @param {boolean} [options.jumpToMessage=true] - Ajoute un lien pour accéder directement au message d'origine.
   * @param {boolean} [options.showMessageDate=true] - Affiche la date du message dans l'embed.
   */
  validateAndSetOptions(options) {
    this.options = {
      starEmoji: options.starEmoji || '⭐',
      starboardChannelID: options.starboardChannelID,
      requiredReactions: Math.max(1, options.requiredReactions || 1),
      ignoreBots: options.ignoreBots !== false,
      ignoreSelf: options.ignoreSelf || false,
      ignoredChannels: Array.isArray(options.ignoredChannels) ? options.ignoredChannels : [],
      ignoreGuilds: Array.isArray(options.ignoreGuilds) ? options.ignoreGuilds : [],
      updateOnReaction: options.updateOnReaction !== false,
      logActions: options.logActions !== false,
      embedColor: options.embedColor || 0xFFAC33,
      maxAttachments: options.maxAttachments || 4,
      allowNSFW: options.allowNSFW || false,
      jumpToMessage: options.jumpToMessage !== false,
      showMessageDate: options.showMessageDate !== false
    };
  }

  initializeEventListeners() {
    this.log('⭐', 'Starboard system is initializing...');
    this.client.on('messageReactionAdd', this.handleReactionAdd.bind(this));
    this.client.on('messageReactionRemove', this.handleReactionRemove.bind(this));
    this.client.on('messageDelete', this.handleMessageDelete.bind(this));
    this.log('⭐', 'Starboard system is active!');
  }

  async handleReactionAdd(reaction, user) {
    try {
      if (!this.shouldProcessReaction(reaction, user)) return;

      const message = reaction.message;
      if (!message || !message.guild) return;

      if (!this.isMessageValid(message)) return;

      await this.processStarboardMessage(reaction, message);
    } catch (error) {
      this.log('❌', `Error handling reaction: ${error.message}`);
    }
  }

  async handleReactionRemove(reaction, user) {
    try {
      if (reaction.emoji.name !== this.options.starEmoji) return;
      const message = reaction.message;
      
      const starboardChannel = await this.getStarboardChannel(message.guild);
      if (!starboardChannel) return;

      const existingMessage = await this.findExistingStarboardMessage(starboardChannel, message);
      if (!existingMessage) return;

      const reactionCount = await this.getValidReactionCount(reaction);
      
      if (reactionCount < this.options.requiredReactions) {
        await existingMessage.delete();
        this.log('🗑️', 'Starboard message removed due to insufficient reactions');
      } else {
        await this.updateExistingMessage(existingMessage, reactionCount);
      }
    } catch (error) {
      this.log('❌', `Error handling reaction remove: ${error.message}`);
    }
  }

  async handleMessageDelete(message) {
    try {
      const starboardChannel = await this.getStarboardChannel(message.guild);
      if (!starboardChannel) return;

      const existingMessage = await this.findExistingStarboardMessage(starboardChannel, message);
      if (existingMessage) {
        await existingMessage.delete();
        this.log('🗑️', 'Original message deleted - removing starboard message');
      }
    } catch (error) {
      this.log('❌', `Error handling message delete: ${error.message}`);
    }
  }

  isMessageValid(message) {
    if (this.options.ignoreGuilds.includes(message.guild.id)) {
      this.log('ℹ️', `Ignoring message from configured guild: ${message.guild.id}`);
      return false;
    }

    if (this.options.ignoredChannels.includes(message.channel.id)) {
      this.log('ℹ️', `Ignoring message from configured channel: ${message.channel.id}`);
      return false;
    }

    if (!this.options.allowNSFW && message.channel.nsfw) {
      this.log('ℹ️', 'Ignoring NSFW channel message');
      return false;
    }

    return true;
  }

  shouldProcessReaction(reaction, user) {
    if (!reaction || !user) return false;
    if (reaction.emoji.name !== this.options.starEmoji) return false;
    if (this.options.ignoreBots && user.bot) return false;
    if (this.options.ignoreSelf && reaction.message.author.id === user.id) return false;
    return true;
  }

  async processStarboardMessage(reaction, message) {
    const starboardChannel = await this.getStarboardChannel(message.guild);
    if (!starboardChannel) return;

    const reactionCount = await this.getValidReactionCount(reaction);
    if (reactionCount < this.options.requiredReactions) return;

    const existingMessage = await this.findExistingStarboardMessage(starboardChannel, message);
    const starEmbed = await this.createStarredEmbed(message, reactionCount);

    if (existingMessage) {
      await this.updateExistingMessage(existingMessage, reactionCount);
    } else {
      await this.sendStarboardMessage(starboardChannel, starEmbed);
    }
  }

  async getStarboardChannel(guild) {
    const channel = guild.channels.cache.get(this.options.starboardChannelID);
    if (!channel) {
      this.log('❌', 'Starboard channel not found');
      return null;
    }
    return channel;
  }

  async getValidReactionCount(reaction) {
    const users = await reaction.users.fetch();
    return users.filter(user => !user.bot || !this.options.ignoreBots).size;
  }

  async findExistingStarboardMessage(starboardChannel, originalMessage) {
    const messages = await starboardChannel.messages.fetch({ limit: 100 });
    return messages.find(msg => {
      const embed = msg.embeds[0];
      return embed?.fields?.[0]?.value === `[Go to message](${originalMessage.url})`;
    });
  }

  async createStarredEmbed(message, reactionCount) {
    const channelMention = `<#${message.channel.id}>`;
    const timestamp = this.options.showMessageDate ? 
      ` | ${new Date(message.createdTimestamp).toLocaleDateString()}` : '';
    const content = `💫 **${reactionCount}** ${channelMention}${timestamp}`;

    const embed = {
      color: this.options.embedColor,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL({ dynamic: true })
      },
      description: message.content || '',
      timestamp: new Date().toISOString(),
      fields: []
    };

    if (this.options.jumpToMessage) {
      embed.fields.push({
        name: 'Source',
        value: `[Jump to message](${message.url})`
      });
    }

    // Handle attachments (images, GIFs, videos)
    const attachments = Array.from(message.attachments.values())
      .slice(0, this.options.maxAttachments);

    if (attachments.length > 0) {
      let mediaAttachments = '';
      let firstImage = null;

      for (const attachment of attachments) {
        const isImage = attachment.contentType?.startsWith('image');
        const isVideo = attachment.contentType?.startsWith('video');
        const isGif = attachment.url.toLowerCase().endsWith('.gif');

        if ((isImage || isGif) && !firstImage) {
          firstImage = attachment;
        } else if (isVideo || (isImage && firstImage)) {
          mediaAttachments += `\n${attachment.url}`;
        }
      }

      if (firstImage) {
        embed.image = { url: firstImage.url };
      }

      if (mediaAttachments) {
        embed.description += mediaAttachments;
      }
    }

    return { embed, content };
  }

  async updateExistingMessage(message, reactionCount) {
    if (!this.options.updateOnReaction) return;

    try {
      const content = message.content.replace(
        /💫 \*\*\d+\*\*/,
        `💫 **${reactionCount}**`
      );
      await message.edit({ content });
      this.log('ℹ️', 'Starboard message updated');
    } catch (error) {
      this.log('❌', `Error updating message: ${error.message}`);
    }
  }

  async sendStarboardMessage(channel, data) {
    const { embed, content } = data;

    if (!embed || (!embed.description && !embed.image)) {
      this.log('❌', 'Invalid embed data');
      return;
    }

    try {
      await channel.send({ content, embeds: [embed] });
      this.log('ℹ️', 'Message sent to starboard');
    } catch (error) {
      this.log('❌', `Error sending message: ${error.message}`);
    }
  }

  log(emoji, message) {
    if (this.options.logActions) {
      console.log(`[ ${emoji} ] ${message}`);
    }
  }
}

module.exports = Starboard;