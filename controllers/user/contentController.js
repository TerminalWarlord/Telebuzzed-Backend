const Request = require('../../models/request');
const Content = require('../../models/content');
const Review = require('../../models/review');

const getTelegramDetails = require('../../utils/getTelegramInfo');

const postRequest = async (req, res, next) => {
    const body = req.body;
    const content = await getTelegramDetails(body.username);
    content.category_id = body.category_id;
    content.language = body.language;
    content.is_nsfw = body.is_nsfw ? true : false;
    content.added_by = req.user._id;
    if (!content.description) {
        content.description = body.description;
    }


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
    const filter = query.filter || 'default';
    const searchTerm = query.searchTerm || '';
    const searchQuery = searchTerm
        ? {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ]
        }
        : {};
    let sortOption = {
        added_on: -1
    };
    if (filter === 'popular') {
        sortOption = { views: -1 };
    }
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 1;
    const skip = (offset - 1) * limit;


    const match = {
        ...searchQuery,
    }
    if (query.type !== 'all') {
        match.type = query.type
    }
    const aggregationPipeline = [
        {
            $match: match
        },
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'content_id',
                as: 'reviews'
            }
        },
        {
            $addFields: {
                totalReviews: { $size: '$reviews' },
                averageRating: {
                    $cond: {
                        if: { $eq: [{ $size: '$reviews' }, 0] },
                        then: 1,
                        else: { $avg: '$reviews.stars' }
                    }
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                username: 1,
                avatar: 1,
                category: 1,
                type: 1,
                totalReviews: 1,
                averageRating: 1
            }
        },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limit + 1 }
    ];

    const content = await Content.aggregate(aggregationPipeline);

    const hasNextPage = content.length > limit;
    const results = content.slice(0, limit);
    console.log(results)
    res.json({
        hasNextPage,
        result: results
    });
};


const getContent = async (req, res, next) => {
    const username = req.params.username;
    const content = await Content.findOne({
        username: { $regex: username, $options: 'i' }
    }).populate({
        path: 'added_by',
        select: 'first_name last_name username'
    })
    content.views += 1;
    content.save();

    res.json({
        result: content
    })
}


const getPendingRequests = async (req, res, next) => {
    const request = await Request.find({
        added_by: req.user._id,
    })
    res.json({
        result: request || []
    })
}



module.exports = {
    postRequest,
    getList,
    getContent,
    getPendingRequests
}