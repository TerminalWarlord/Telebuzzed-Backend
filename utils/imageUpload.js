const fs = require('fs');
const mime = require('mime-types');

require('dotenv').config();

const DEFAULT_IMAGE = 'https://i.ibb.co/FbCBRbmr/image.png';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";

async function uploadImage(filePath) {
    if (!filePath) {
        return DEFAULT_IMAGE;
    }
    try {

        const mimetype = mime.lookup(filePath) || "application/octet-stream";

        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer], { type: mimetype });

        const formData = new FormData();

        formData.append('key', IMGBB_API_KEY);
        formData.append('image', blob, require('path').basename(filePath));
        const res = await fetch('https://api.imgbb.com/1/upload', {
            method: "POST",
            body: formData,
        })

        const resData = await res.json();
        if (!res.ok) {
            throw Error("Failed to upload image!");
        }
        return resData.data.url;
    }
    catch (err) {
        console.log(err)
        throw Error("Failed to upload image!");
    }

}


module.exports = {
    uploadImage,
    DEFAULT_IMAGE
};
