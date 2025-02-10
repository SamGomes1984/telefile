const { Telegraf } = require("telegraf");
const AWS = require("aws-sdk");
const axios = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WASABI_ACCESS_KEY = process.env.WASABI_ACCESS_KEY;
const WASABI_SECRET_KEY = process.env.WASABI_SECRET_KEY;
const WASABI_BUCKET_NAME = process.env.WASABI_BUCKET_NAME;
const WASABI_REGION = process.env.WASABI_REGION;
const WASABI_ENDPOINT = `https://s3.${WASABI_REGION}.wasabisys.com`;
const BASE_URL = process.env.BASE_URL;

const bot = new Telegraf(BOT_TOKEN);

const s3 = new AWS.S3({
    endpoint: WASABI_ENDPOINT,
    accessKeyId: WASABI_ACCESS_KEY,
    secretAccessKey: WASABI_SECRET_KEY,
    region: WASABI_REGION,
    signatureVersion: "v4",
});

async function uploadToWasabi(fileStream, fileName) {
    try {
        const uploadParams = {
            Bucket: WASABI_BUCKET_NAME,
            Key: fileName,
            Body: fileStream,
            ContentType: "application/octet-stream",
        };
        await s3.upload(uploadParams).promise();

        return `${BASE_URL}/api/file/download?file=${fileName}`;
    } catch (error) {
        console.error("Wasabi Upload Error:", error);
        throw new Error("Failed to upload to Wasabi.");
    }
}

bot.on("message", async (ctx) => {
    try {
        const fileObj = ctx.message.document || ctx.message.video || ctx.message.audio;
        if (!fileObj) return;

        const fileId = fileObj.file_id;
        const fileName = fileObj.file_name || `file_${Date.now()}`;
        const fileUrl = await ctx.telegram.getFileLink(fileId);

        const response = await axios({
            url: fileUrl.href,
            method: "GET",
            responseType: "stream",
        });

        const fileLink = await uploadToWasabi(response.data, fileName);
        const streamLink = `${BASE_URL}/stream?file=${fileName}`;

        await ctx.reply(`Your file is ready!\nDownload: ${fileLink}\nStream: ${streamLink}`);
    } catch (error) {
        console.error("Error:", error);
        await ctx.reply("Error processing your file.");
    }
});

bot.launch(); 