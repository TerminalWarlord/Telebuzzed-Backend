const cheerio = require('cheerio');
const uploadImage = require('./cloudnaryUpload');
const crypto = require('crypto');

const Image = require('../models/image');

// Function to normalize Telegram URL
function normalizeTelegramUrl(input) {
    // Remove any leading '@' symbol
    if (input.startsWith('@')) {
        input = input.slice(1);
    }
    // Check if the input already starts with 'https://t.me/'
    if (!input.startsWith('https://t.me/')) {
        input = `https://t.me/${input}`;
    }
    return input;
}

async function getTelegramDetails(inputUrl) {
    try {
        // Normalize the user input to a proper Telegram URL
        const url = normalizeTelegramUrl(inputUrl);
        console.log(url)
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        let contentType = 'bot';
        let avatar = $('.tgme_page_photo_image').attr('src')
            || 'https://res.cloudinary.com/djsn4u5ea/image/upload/v1728366113/telebuzzed_default.png';

        // Handle avatar URL
        if (avatar && !avatar.startsWith('https://')) {
            avatar = avatar.startsWith('//') ? `https:${avatar}` : `https://${avatar}`;
        }
        if (avatar.startsWith('data:')) {
            avatar = 'https://res.cloudinary.com/djsn4u5ea/image/upload/v1728366113/telebuzzed_default.png';
        }
        const title = $('.tgme_page_title').text().trim();
        let username = $('.tgme_page_extra').text().trim().replace("@", "");
        let members = null;
        let subscribers = null;

        if (username.includes('members')) {
            contentType = 'group';
            members = parseInt(username.split(' members')[0].replace(/\s/g, ""));
            username = url.split('/').pop();
        }
        if (username.includes('subscribers')) {
            contentType = 'channel';
            subscribers = parseInt(username.split(' subscribers')[0].replace(/\s/g, ""));
            username = url.split('/').pop();
        }

        const descriptionHtml = $('.tgme_page_description').html();
        const description = descriptionHtml
            ? descriptionHtml.replace(/<br\s*\/?>/gi, '\n').replace(/(<([^>]+)>)/gi, "").trim()
            : '';
        const cloudinaryUrl = await uploadImage(avatar);
        const randomStr = crypto.randomBytes(4).toString('hex');
        const cdnUrl = username + "_" + randomStr + '.' + cloudinaryUrl.split('.').pop();
        await Image.create({
            path: cdnUrl,
            content: cloudinaryUrl
        });
        const content = {
            name: title,
            type: contentType,
            username,
            description,
            members,
            subscribers,
            avatar: cdnUrl,
        };

        return content;
    } catch (error) {
        console.error(`Error fetching details for ${inputUrl}:`, error.message);
        throw new Error(`Error fetching details for ${inputUrl}: ${error.message}`);
    }
}

module.exports = getTelegramDetails;


// getTelegramDetails('https://t.me/transparency')
//     .then(content => console.log(content))
//     .catch(error => console.error(error));