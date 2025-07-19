import TelegramBot from "node-telegram-bot-api";
import { BOT_TOKEN, MONGO_URI } from "./config.js";
import { connectDB, Key } from "./db.js";
import { v4 as uuidv4 } from "uuid";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

await connectDB(MONGO_URI);

function generateKey(type) {
  const key = `${type.toUpperCase()}-${uuidv4().split("-")[0]}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return { key, expiresAt };
}

bot.onText(/^\/genkey (normal|better|premium)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const type = match[1];

  const { key, expiresAt } = generateKey(type);

  await Key.create({ key, type, expiresAt });

  bot.sendMessage(chatId, `✅ Generated ${type.toUpperCase()} Key:\n\`${key}\`\n🗓️ Valid for 7 days`, { parse_mode: "Markdown" });
});
