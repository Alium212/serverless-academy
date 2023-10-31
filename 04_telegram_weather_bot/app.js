const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const botToken = '6771148633:AAECedxF9GKtSGqKdkKBAWsnZ5pdn8qV9s8';
const openWeatherAPIKey = 'c057935ee715140565d8444fc2b41fca';
const city = 'Dnipro';

const bot = new TelegramBot(botToken, { polling: true });

const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatExpression = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const sendWelcomeMessage = (chatId) => {
    bot.sendMessage(
        chatId,
        'Welcome to the Weather Forecast Bot. Select an option:',
        {
            reply_markup: {
                keyboard: [[`Forecast in ${city}`]],
                resize_keyboard: true,
            },
        }
    );
};

const sendUpdateIntervalMessage = (chatId) => {
    bot.sendMessage(chatId, 'Select update interval:', {
        reply_markup: {
            keyboard: [['Every 3 hours', 'Every 6 hours']],
            resize_keyboard: true,
        },
    });
};

const getWeatherForecast = async (msg, interval) => {
    const chatId = msg.chat.id;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=8&units=metric&appid=${openWeatherAPIKey}`;

    try {
        const response = await axios.get(apiUrl);
        const forecast = response.data.list;
        const dateCache = {};

        let message = `Weather forecast for ${city} every ${interval} hours:\n\n`;

        for (let i = 0; i < forecast.length; i += interval / 3) {
            const weather = forecast[i];
            const date = new Date(weather.dt * 1000);
            const dateKey = date.toDateString();
            const formattedTime = formatTime(date);
            const formattedDate = dateCache[dateKey] ? '' : `${dateKey}\n`;
            const weatherDescription = formatExpression(weather.weather[0].description);
            const temperature = weather.main.temp;

            dateCache[dateKey] = true;
            message += `${formattedDate}- ${formattedTime}: ${weatherDescription}, Temperature: ${temperature}°C\n`;
        }
        bot.sendMessage(chatId, message);
    } catch (error) {
        bot.sendMessage(
            chatId,
            'An error occurred while fetching the weather data. Please try again later.'
        );
    }
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendWelcomeMessage(chatId);
});

bot.onText(/Forecast in Dnipro/, (msg) => {
    const chatId = msg.chat.id;
    sendUpdateIntervalMessage(chatId);
});

bot.onText(/Every (3|6) hours/, (msg, match) => {
    const interval = parseInt(match[1]);
    getWeatherForecast(msg, interval);
});