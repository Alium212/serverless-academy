const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const NodeCache = require("node-cache");

const token = "6418499223:AAEMTxoVI-KSfMyYRe7gUn9_LyV-KItyowo";
const bot = new TelegramBot(token, { polling: true });
const cache = new NodeCache({ stdTTL: 60 });

const privatBankApi = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5";
const monoBankApi = "https://api.monoBank.ua/bank/currency";

const getPrivatBankRates = async () => {
    try {
        const response = await axios.get(privatBankApi);
        return response.data;
    } catch (error) {
        console.error("Error fetching PrivatBank rates:", error);
        return null;
    }
};

const getMonoBankRates = async () => {
    try {
        const response = await axios.get(monoBankApi);
        return response.data;
    } catch (error) {
        console.error("Error fetching monoBank rates:", error);
        return null;
    }
};

const getExchangeString = (rateBuy, rateSell) => {
    if(!rateBuy && !rateSell) {
        return 'No data.';
    }
    return `${rateBuy} / ${rateSell}`;
};

const updateCachedData = async () => {
    const [privatBankRates, monoBankRates] = await Promise.all([
        getPrivatBankRates(),
        getMonoBankRates(),
    ]);

    const rates = formatRates(privatBankRates, monoBankRates);
    const usdRatesMessage = `USD Exchange Rates:\n\nPrivatBank: ${getExchangeString(rates.usd.privatBankBuy, rates.usd.privatBankSell)}\nMonoBank: ${getExchangeString(rates.usd.monoBankBuy, rates.usd.monoBankSell)}`;
    const eurRatesMessage = `EUR Exchange Rates:\n\nPrivatBank: ${getExchangeString(rates.eur.privatBankBuy, rates.eur.privatBankSell)}\nMonoBank: ${getExchangeString(rates.eur.monoBankBuy, rates.eur.monoBankSell)}`;

    cache.set("usdRates", usdRatesMessage, 60);
    cache.set("eurRates", eurRatesMessage, 60);
    cache.set("privatBankRates", privatBankRates, 60);
    cache.set("monoBankRates", monoBankRates, 60);
};

const formatRates = (privatBankRates, monoBankRates) => {
    const privatBankUSD = privatBankRates.find((rate) => rate.ccy === "USD");
    const privatBankEUR = privatBankRates.find((rate) => rate.ccy === "EUR");
    const monoBankUSD = monoBankRates.find(
        (rate) => rate.currencyCodeA === 840 && rate.currencyCodeB === 980
    );
    const monoBankEUR = monoBankRates.find(
        (rate) => rate.currencyCodeA === 978 && rate.currencyCodeB === 980
    );

    return {
        usd: {
            privatBankBuy: privatBankUSD?.buy,
            privatBankSell: privatBankUSD?.sale,
            monoBankBuy: monoBankUSD?.rateBuy,
            monoBankSell: monoBankUSD?.rateSell,
        },
        eur: {
            privatBankBuy: privatBankEUR?.buy,
            privatBankSell: privatBankEUR?.sale,
            monoBankBuy: monoBankEUR?.rateBuy,
            monoBankSell: monoBankEUR?.rateSell,
        },
    };
};

const keyboard = {
    keyboard: [["USD", "EUR"]],
    one_time_keyboard: false,
    resize_keyboard: true,
};

const sendCachedRates = (chatId, currency) => {
    const cachedRates = cache.get(`${currency}Rates`);

    if (cachedRates) {
        bot.sendMessage(chatId, cachedRates, {
            reply_markup: keyboard,
        });
    } else {
        bot.sendMessage(chatId, "Exchange rate data is not available at the moment.", {
            reply_markup: keyboard,
        });
    }
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        "Welcome! You can check exchange rates with this bot.",
        {
            reply_markup: keyboard,
        }
    );
});

bot.onText(/USD/, async (msg) => {
    const chatId = msg.chat.id;
    const privatBankRates = cache.get("privatBankRates");
    const monoBankRates = cache.get("monoBankRates");

    if (!privatBankRates || !monoBankRates) {
        await updateCachedData();
    }

    sendCachedRates(chatId, "usd");
});

bot.onText(/EUR/, async (msg) => {
    const chatId = msg.chat.id;
    const privatBankRates = cache.get("privatBankRates");
    const monoBankRates = cache.get("monoBankRates");

    if (!privatBankRates || !monoBankRates) {
        await updateCachedData();
    }

    sendCachedRates(chatId, "eur");
});
