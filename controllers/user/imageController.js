const Image = require('../../models/image');
const sharp = require('sharp');

const getImage = async (req, res, next) => {
    try {
        const imagePath = req.params.imagePath;
        const quality = parseInt(req.query.quality) || 80; // Allow quality adjustment via query param
        const width = parseInt(req.query.width) || null; // Optional width resizing

        // Find image in database
        const image = await Image.findOne({ path: imagePath });
        if (!image) {
            return res.status(404).json({
                result: { message: "Invalid image path!" }
            });
        }

        // Fetch the image from ImgBB
        const response = await fetch(image.content);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the image buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Initialize Sharp pipeline
        let sharpPipeline = sharp(buffer);

        // Resize if width is specified
        if (width) {
            sharpPipeline = sharpPipeline.resize(width, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        // Check if browser supports WebP
        const acceptHeader = req.headers.accept || '';
        const supportsWebP = acceptHeader.includes('image/webp');

        if (supportsWebP) {
            // Convert to WebP with specified quality
            sharpPipeline = sharpPipeline.webp({
                quality: quality,
                effort: 4, // Balance between compression speed and quality (0-6)
                lossless: false
            });
        }

        // Process the image
        const optimizedImageBuffer = await sharpPipeline.toBuffer();

        // Set appropriate headers
        res.set('Content-Type', supportsWebP ? 'image/webp' : response.headers.get('content-type'));
        res.set('Content-Length', optimizedImageBuffer.length);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.set('Last-Modified', new Date().toUTCString());

        // Send the optimized image
        return res.send(optimizedImageBuffer);

    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({
            result: { message: "Error processing image" }
        });
    }
};

module.exports = {
    getImage,
};