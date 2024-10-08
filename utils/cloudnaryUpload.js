const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

async function uploadImage(url) {
    if (!url) {
        return 'https://res.cloudinary.com/djsn4u5ea/image/upload/v1728366113/telebuzzed_default.png';
    }

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(url)
        .catch((error) => {
            console.log(error);
        });
    return uploadResult.secure_url;

}


module.exports = uploadImage;