const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const { Intents } = require('discord.js');
const { join } = require('path');
const config = require('../config');
const { CreateEmbed } = require('../Utility/CreateEmbed');
const { logger } = require('../Utility/Logger');

module.exports = class NoteClient extends AkairoClient {
  constructor() {
    super({
      ownerID: config.owners,
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    }, {
      partials: ['CHANNEL', 'MESSAGE', 'GUILD_MEMBER'],
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });
    this.logger = logger;
    this.config = config;
    this.commandHandler = new CommandHandler(this, {
      allowMention: false,
      directory: join(__dirname, '..', 'Commands'),
      prefix: config.prefix,
      defaultCooldown: 3000,
      argumentDefaults: {
        prompt: {
          timeout: CreateEmbed('info', '⛔ | command timeout.'),
          ended: CreateEmbed('info', '⛔ | invalid arguments, command session has ended.'),
          retries: 3,
          time: 30000,
        },
      },
    }).on('commandFinished', (msg, command) => {
      this.logger.info(`[${msg.author.tag}] USING [${command.id.toUpperCase()}] COMMANDS`);
    }).on('cooldown', async (msg, command, remaining) => {
      const awaitMsg = await msg.channel.send(CreateEmbed('warn', `Chill.. wait ${(remaining / 1000).toFixed(2)} second(s) to use command again`));
      setTimeout(() => awaitMsg.delete(), remaining);
      this.logger.warn(`[${msg.author.tag}] GETTING RATE LIMIT ON [${command.id.toUpperCase()}] COMMANDS`);
    });
    this.ListenerHandler = new ListenerHandler(this, {
      directory: join(__dirname, '..', 'Listeners'),
    });
  }

  initialize() {
    this.commandHandler.loadAll();
    this.ListenerHandler.setEmitters({
      erela: this.erela,
    });
    this.ListenerHandler.loadAll();

    this.login();
  }
};
