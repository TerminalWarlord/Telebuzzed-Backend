const Request = require('../../models/request');
const Content = require('../../models/content');

const getTelegramDetails = require('../../utils/getTelegramInfo');

const postRequest = async (req, res, next) => {
    const body = req.body;
    const content = await getTelegramDetails(body.username);
    content.category = body.category;
    content.language = body.language;
    content.is_nsfw = body.is_nsfw ? true : false;
    content.added_by = req.user._id;

    try {
        await Request.create(content);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            result: {
                message: "Failed to add!"
            }
        })
    }

    res.json({
        result: {
            message: "Successfully added!"
        }
    })
}
// filter
// limit
// offset
// searchTerm
// type
const getList = async (req, res, next) => {
    const query = req.query;
    const filter = query.filter || 'popular';
    const searchTerm = query.searchTerm || '';
    const searchQuery = searchTerm
        ? {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive match
                { description: { $regex: searchTerm, $options: 'i' } }
            ]
        }
        : {};

    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 1;
    const skip = (offset - 1) * limit
    const content = await Content.find({
        type: query.type || 'bot',
        ...searchQuery,
    })
        .limit(limit + 1)
        .skip(skip)
        .select('name description username avatar category')
        .exec();

    res.json({
        result: content
    })
}

const getContent = async (req, res, next) => {
    const username = req.params.username;
    const content = await Content.findOne({
        username: { $regex: username, $options: 'i' }
    }).populate({
        path: 'added_by',
        select: 'first_name last_name username'
    })

    res.json({
        result: content
    })
}






module.exports = {
    postRequest,
    getList,
    getContent
}