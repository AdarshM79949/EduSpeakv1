const { Client, GatewayIntentBits } = require('discord.js');
const env = require('./env');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let isReady = false;

client.once('ready', () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  isReady = true;
});

client.login(env.BOT_TOKEN).catch((err) => {
  console.error('❌ Failed to login Discord bot:', err.message);
});

/**
 * Returns a Discord channel by its ID.
 * Throws if the bot is not ready or channel not found.
 */
async function getChannel(channelId) {
  if (!isReady) {
    // Wait up to 10 seconds for bot to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Discord bot not ready')), 10000);
      client.once('ready', () => { clearTimeout(timeout); resolve(); });
      if (isReady) { clearTimeout(timeout); resolve(); }
    });
  }
  const channel = await client.channels.fetch(channelId);
  if (!channel) throw new Error(`Channel ${channelId} not found`);
  return channel;
}

module.exports = { client, getChannel };
