const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const Key = require('./models/Key');
const mongoose = require('mongoose');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Helper: Generate key
function generateKey(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 Welcome ${msg.from.first_name}!\nUse /createkey [normal|better|premium] to generate a key.\nUse /checkkey [key] to verify a key.`);
});

// /createkey command (for admin only, check chat id or user id)
bot.onText(/\/createkey (.+)/, async (msg, match) => {
  const keyType = match[1].toLowerCase();
  const chatId = msg.chat.id;

  // Optional admin check
  const allowedAdmins = [msg.chat.id]; // Replace with your actual admin user id
  if (!allowedAdmins.includes(msg.chat.id)) {
    return bot.sendMessage(chatId, `❌ You are not authorized to create keys.`);
  }

  if (!['normal', 'better', 'premium'].includes(keyType)) {
    return bot.sendMessage(chatId, '❌ Invalid key type. Use normal, better, or premium.');
  }

  const key = generateKey();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await Key.create({ key, type: keyType, expiresAt });

  bot.sendMessage(chatId, `✅ Key Created:\nKey: \`${key}\`\nType: ${keyType}\nValid for 7 days.`, { parse_mode: 'Markdown' });
});

// /checkkey command
bot.onText(/\/checkkey (.+)/, async (msg, match) => {
  const userKey = match[1];
  const found = await Key.findOne({ key: userKey });

  if (!found) return bot.sendMessage(msg.chat.id, '❌ Invalid key.');

  const now = new Date();
  if (now > found.expiresAt) {
    return bot.sendMessage(msg.chat.id, '⚠️ This key has expired.');
  }

  const remaining = Math.floor((found.expiresAt - now) / (1000 * 60 * 60 * 24));
  bot.sendMessage(msg.chat.id, `✅ Key is valid.\nType: ${found.type}\nExpires in ${remaining} days.`);
});
