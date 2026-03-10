// Discord Bot → Supabase webhook forwarder
// OKay 

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();

// Render/Railway port requirement
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Discord bot running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const DISCORD_BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!DISCORD_BOT_TOKEN || !WEBHOOK_URL) {
  console.error("Missing DISCORD_BOT_TOKEN or WEBHOOK_URL");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📡 Sending messages to webhook`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const guildId = message.guild?.id;
  const channelName = message.channel?.name || "DM";

  const messageUrl =
    `https://discord.com/channels/${guildId}/${message.channel.id}/${message.id}`;

  try {

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message_content: message.content,
        author_name: message.author.username,
        channel_name: channelName,
        message_id: message.id,
        message_url: messageUrl
      })
    });

    const data = await response.json();

    if (data.matched > 0) {
      console.log(`🔔 ${data.matched} guest match detected`);
    }

  } catch (error) {

    console.error("Webhook error:", error.message);

  }

});

client.login(DISCORD_BOT_TOKEN);
