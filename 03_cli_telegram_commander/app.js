const { program } = require('commander');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const packageJson = require('./package.json');

const token = '6677373527:AAHfNNWlT81fwQQDYzgWPVaglsLLE_NEFuQ';
const bot = new TelegramBot(token, { polling: true });

const handleError = (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
};

const handleChatNotFound  = () => {
    console.error('No recent chat found.');
    process.exit(1);
};

const sendMessage = async (message) => {
    try {
        const updates = await bot.getUpdates({ limit: 1 });
        if (updates.length === 0) {
            handleChatNotFound();
        }
        const chatId = updates[0].message.chat.id;
        await bot.sendMessage(chatId, message);
        process.exit(0);
    } catch (err) {
        handleError(err);
    }
}

const sendPhoto = async (photoPath) => {
    try {
        const updates = await bot.getUpdates({ limit: 1 });
        if (updates.length === 0) {
            handleChatNotFound();
        }
        const chatId = updates[0].message.chat.id;
        const photoData = fs.readFileSync(photoPath);
        await bot.sendPhoto(chatId, photoData);
        process.exit(0);
    } catch (err) {
        handleError(err);
    }
}

program
    .version(packageJson.version, '-v, --version')
    .command('send-message <message>')
    .alias('m')
    .alias('message')
    .description('Send message to Telegram bot')
    .action(sendMessage);

program
    .command('send-photo <photoPath>')
    .alias('p')
    .alias('photo')
    .description('Send photo to Telegram bot. Just drag and drop it console after p-flag.')
    .action(sendPhoto);

program.parse(process.argv);
