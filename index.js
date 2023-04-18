require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const VkBot = require('node-vk-bot-api');
const gTTS = require('gtts');
const { Configuration, OpenAIApi } = require("openai");

const helper = require('./helper');

const TG_TOKEN = process.env.TG_TOKEN;
const VK_TOKEN = process.env.VK_TOKEN;
const OPENAI_TOKEN = process.env.OPENAI_TOKEN;
const OPENAI_MODEL = process.env.OPENAI_MODEL;

const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI_TOKEN,
}));

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
const vkBot = new VkBot(VK_TOKEN);

setInterval(helper.clearTmp, 300000);

async function ask(prompt) {
    const response = await openai.createCompletion({
        model: OPENAI_MODEL,
        prompt,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    },
    {
        timeout: 90000
    });
    const answer = response.data.choices[0].text;
    return answer;
}

// В тг "!" - для распознования и создания голосовых ответов
tgBot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
        let text = helper.fulltrim(msg.text);
        const isHaveSign = text[0] === '!';

        if (isHaveSign) text = text.slice(1, text.length);
    
        let answer = await ask(text);

        if (isHaveSign) {
            let filePath = helper.generateFilePath();
            (new gTTS(answer, 'ru')).save(filePath, function(err) {
                if (err) tgBot.sendMessage(chatId, answer);
                tgBot.sendVoice(chatId, filePath); 
            })
        } else {
            tgBot.sendMessage(chatId, answer);
        }
    } catch (err) {
        try {
            tgBot.sendMessage(chatId, 'Не могу обработать запрос');
        } catch (err) {} finally {
            console.error(err);
        }
    }
});

// В вк "!" - для распознования среди всех сообщений сообщений для бота (бота можно добавить в группу)
vkBot.on(async (ctx) => {
    let text = helper.fulltrim(ctx.message.text);
    const isHaveSign = text[0] === '!';
    if (isHaveSign) {
        try {
            text = text.slice(1, text.length);
            let answer = await ask(text);
            ctx.reply(answer);
        } catch (err) {
            try {
                ctx.reply('Не могу обработать запрос');
            } catch (err) {} finally {
                console.error(err);
            }
        }
    }
});

tgBot.on('webhook_error', async (err) => {
    console.error(err);
});

tgBot.on('polling_error', async (err) => {
    console.error(err);
});

vkBot.startPolling((err) => {
    if (err) {
      console.error(err);
    }
});