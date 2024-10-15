const Post = require('../../models/post');
const slugify = require('slugify');
const createImage = require('../../utils/uploadImageToDb');


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

    // if (!file) {
    //     return res.status(400).json({ error: 'No file uploaded' });
    // }

    // Log file information
    console.log('Uploaded file:', file);


    let baseSlug = await generateSlug(title.trim());

    let imageOnDb;
    if (file) {
        imageOnDb = await createImage(baseSlug, file, title.trim());

    }
    console.log({
        title,
        content,
        is_post: isPost,
        featured_image: imageOnDb
    })

    try {
        const newPostObj = {
            title,
            content,
            slug: baseSlug,
            author_id: req.user._id,
            is_post: isPost,
        }
        if (imageOnDb) {
            newPostObj.featured_image = imageOnDb

        }
        Post.create(newPostObj);
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
    const type = query.type || 'all';
    const skip = (offset - 1) * offset;

    let matchQuery = {};
    if (type !== 'all') {
        if (type === 'post') {
            matchQuery = { is_post: true }
        }
        else {
            matchQuery = { is_post: false }
        }
    }
    const allPosts = await Post.find(matchQuery)
        .populate({
            path: 'author_id', select: 'first_name last_name username avatar'
        })
        .select('title slug content is_post featured_image posted_on')
        .limit(limit + 1)
        .skip(skip)

    const results = allPosts.slice(0, limit);
    return res.json({
        hasNextPage: allPosts.length > limit,
        result: results || []
    })
}



const getPostDetails = async (req, res, next) => {
    const postSlug = req.query.postSlug;
    try {
        const post = await Post.findOne({
            slug: postSlug
        }).populate('author_id');
        if (!post) {
            return res.status(404).json({
                result: {
                    message: "Not found!"
                }
            })
        }
        return res.json({
            result: post
        })
    }
    catch (err) {
        return res.status(404).json({
            result: {
                message: "Not found!"
            }
        })
    }

}
const putEditPost = async (req, res, next) => {
    const postSlug = req.params.postSlug;
    const file = req.file;
    let imageOnDb = null;
    if (file) {
        console.log(file)
        imageOnDb = await createImage(postSlug, file);
    }
    // let imagePath
    const body = req.body;
    console.log(postSlug, body);
    const post = await Post.findOne({
        slug: postSlug
    })
    if (!post) {
        return res.status(404).json({
            result: {
                message: "Post not found!"
            }
        })
    }

    post.title = body.title;
    post.is_post = body.isPost;
    post.content = body.content;
    if (imageOnDb) post.featured_image = imageOnDb;
    try {
        await post.save();
        return res.json({
            result: {
                message: "Post has been updated!"
            }
        })
    }
    catch (err) {
        return res.status(403).json({
            result: {
                message: "Post not found!"
            }
        })
    }
}

const deletePost = async (req, res, next) => {
    const postSlug = req.params.postSlug;
    const post = await Post.findOneAndDelete({
        slug: postSlug
    })
    if (!post) {
        return res.status(404).json({
            result: {
                message: "Post not found!"
            }
        })
    }
    else {
        return res.json({
            result: {
                message: "Post has been deleted."
            }
        })
    }
}

module.exports = {
    adminPostSubmission,
    getAllPosts,
    getPostDetails,
    putEditPost,
    deletePost
}