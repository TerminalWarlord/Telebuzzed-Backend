const Image = require('../models/image');

const uploadImage = require('./cloudnaryUpload');




const createImage = async (baseSlug, file) => {
    // Get the file path
    const filePath = file.path;
    const cdnPath = await uploadImage(filePath);
    let imageOnDb = baseSlug + '.' + filePath.split('.').pop()
    console.log(filePath, cdnPath, imageOnDb);
    try {
        await Image.create({
            path: imageOnDb,
            content: cdnPath
        })
        console.log("Uploaded")
    }
    catch (err) {
        console.log(err);
        imageOnDb = baseSlug + '.' + Date.now() + '.' + filePath.split('.').pop();
        await Image.create({
            path: imageOnDb,
            content: cdnPath
        })
    }
    return imageOnDb;
}

module.exports = createImage;