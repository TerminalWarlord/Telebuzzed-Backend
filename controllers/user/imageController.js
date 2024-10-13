const Image = require('../../models/image');

const getImage = async (req, res, next) => {
    try {
        const imagePath = req.params.imagePath;
        const image = await Image.findOne({
            path: imagePath,
        });

        if (!image) {
            return res.status(404).json({
                result: {
                    message: "Invalid image path!"
                }
            });
        }

        // Fetch the image from Cloudinary
        const response = await fetch(image.content);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the image as a Blob
        const imageBlob = await response.blob();

        // Set the appropriate headers
        res.set('Content-Type', response.headers.get('content-type'));
        res.set('Content-Length', response.headers.get('content-length'));

        // Send the image data
        return res.send(Buffer.from(await imageBlob.arrayBuffer()));
    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).json({
            result: {
                message: "Error fetching image"
            }
        });
    }
};

module.exports = {
    getImage,
};