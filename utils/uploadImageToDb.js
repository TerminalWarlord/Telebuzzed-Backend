const Image = require('../models/image');

const { uploadImage } = require('./imageUpload');




const createImage = async (baseSlug, file, caption = null) => {
    // Get the file path
    await Image.syncIndexes();
    const filePath = file.path;
    const cdnPath = await uploadImage(filePath);
    let imageOnDb = baseSlug + '.' + filePath.split('.').pop()
    console.log(filePath, cdnPath, imageOnDb);
    try {
        await Image.create({
            path: imageOnDb,
            content: cdnPath,
            caption
        })
        console.log("Uploaded")
    }
    catch (err) {
        imageOnDb = baseSlug + '_' + Date.now() + '.' + filePath.split('.').pop();
        await Image.updateOne(
            { path: imageOnDb },           
            { $set: { content: cdnPath } }, 
            { upsert: true }             
        );
    }
    return imageOnDb;
}

module.exports = createImage;