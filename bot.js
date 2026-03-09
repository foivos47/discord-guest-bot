// Discord Bot - Forward guest mentions to Supabase webhook
// Deploy this on Railway, Render, or any Node.js hosting service
//
// Required environment variables:
//   DISCORD_BOT_TOKEN - Your bot token from Discord Developer Portal
//   WEBHOOK_URL - Your edge function URL (see below)
//
// Webhook URL:
//   https://khfmihydosbiahrrznxx.supabase.co/functions/v1/discord-webhook
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const { Client, GatewayIntentBits } = require('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!DISCORD_BOT_TOKEN || !WEBHOOK_URL) {
  console.error('Missing DISCORD_BOT_TOKEN or WEBHOOK_URL environment variables');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📡 Forwarding messages to ${WEBHOOK_URL}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const guildId = message.guild?.id;
  const channelName = message.channel?.name || 'DM';
  const messageUrl = `https://discord.com/channels/${guildId}/${message.channel.id}/${message.id}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_content: message.content,
        author_name: message.author.username,
        channel_name: channelName,
        message_id: message.id,
        message_url: messageUrl,
      }),
    });

    const data = await response.json();
    if (data.matched > 0) {
      console.log(`🔔 Matched ${data.matched} guest(s) in #${channelName}: "${message.content.substring(0, 50)}..."`);
    }
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
  }
});

client.login(DISCORD_BOT_TOKEN);
