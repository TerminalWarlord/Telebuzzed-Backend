const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

async function uploadImage(url) {

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