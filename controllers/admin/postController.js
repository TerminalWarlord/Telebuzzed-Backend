const Post = require('../../models/post');
const Image = require('../../models/image');
const slugify = require('slugify');


const uploadImage = require('../../utils/cloudnaryUpload');

const generateSlug = async (title, sequence = null) => {
    let slug = slugify(title, { lower: true, strict: true })
    if (sequence) {
        slug += '_' + sequence;
    }
    const res = await Post.countDocuments({
        slug
    });
    if (res > 0) {
        return generateSlug(title, sequence === null ? 1 : sequence + 1);
    }
    return slug;
}


const adminPostSubmission = async (req, res, next) => {
    const { title, content, isPost } = req.body;
    // Access file information from req.file
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Log file information
    console.log('Uploaded file:', file);


    let baseSlug = await generateSlug(title);

    // Get the file path
    const filePath = file.path;
    const cdnPath = await uploadImage(filePath);
    console.log(filePath, cdnPath);
    let imageOnDb = baseSlug + '.' + filePath.split('.').pop()
    try {
        await Image({
            path: baseSlug + '.' + filePath.split('.').pop(),
            content: cdnPath
        })
    }
    catch (err) {
        imageOnDb = baseSlug + '.' + Date.now() + '.' + filePath.split('.').pop();
        await Image({
            path: baseSlug + '.' + Date.now() + '.' + filePath.split('.').pop(),
            content: cdnPath
        })
    }
    console.log({
        title,
        content,
        isPost: isPost,
        featuredImage: imageOnDb
    })

    try {
        Post.create({
            title,
            content,
            slug: baseSlug,
            author_id: req.user._id,
            isPost: isPost,
            featuredImage: imageOnDb
        });
        return res.json({
            result: {
                message: "Successfully posted."
            }
        })
    }
    catch (err) {
        return res.status(400).json({
            result: {
                message: "Could not save the post!"
            }
        })
    }

}




const getAllPosts = async (req, res, next) => {

    const query = req.query;
    const limit = query.limit || 20;
    const offset = query.offset || 1;
    const skip = (offset - 1) * offset;

    const allPosts = await Post.find()
        .populate({
            path: 'author_id', select: 'first_name last_name username avatar'
        })
        .select('title slug content isPost featured_image posted_on')
        .limit(limit + 1)
        .skip(skip)

    const results = allPosts.slice(0, limit);
    return res.json({
        hasNextPage: allPosts.length > limit,
        result: results || []
    })



}
module.exports = {
    adminPostSubmission,
    getAllPosts
}