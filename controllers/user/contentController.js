const mongoose = require('mongoose')

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
    const category_id = query.category_id;
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
    };
    if (query.type !== 'all') {
        match.type = query.type;
    }
    // Add category_id to the match if it's provided and not equal to 1
    if (category_id && category_id !== '1') {
        try {
            match.category_id = new mongoose.Types.ObjectId(category_id);
        } catch (error) {
            // If category_id is not a valid ObjectId, we'll ignore it
            console.error('Invalid category_id:', category_id);
        }
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
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
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
                },
                category: { $arrayElemAt: ["$category", 0] }
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

    try {
        const content = await Content.aggregate(aggregationPipeline);

        const hasNextPage = content.length > limit;
        const results = content.slice(0, limit);
        console.log(results);
        res.json({
            hasNextPage,
            result: results
        });
    } catch (error) {
        console.error('Error in getList:', error);
        res.status(500).json({ error: 'An error occurred while fetching the list' });
    }
};


const getContent = async (req, res, next) => {
    try {
        const username = req.params.username;

        const [content] = await Content.aggregate([
            // Match the content by username
            {
                $match: {
                    username: { $regex: username, $options: 'i' }
                }
            },
            // Lookup reviews for this content
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'content_id',
                    as: 'reviews'
                }
            },
            // Add fields for total reviews and average rating
            {
                $addFields: {
                    totalReviews: { $size: '$reviews' },
                    averageRating: { $avg: '$reviews.stars' }
                }
            },
            // Lookup category information
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            // Unwind the category array
            {
                $unwind: '$category'
            },
            // Lookup user information for added_by
            {
                $lookup: {
                    from: 'users',
                    localField: 'added_by',
                    foreignField: '_id',
                    as: 'added_by'
                }
            },
            // Unwind the added_by array
            {
                $unwind: '$added_by'
            },
            // Project only the fields we need
            {
                $project: {
                    name: 1,
                    username: 1,
                    type: 1,
                    members: 1,
                    subscribers: 1,
                    language: 1,
                    description: 1,
                    views: 1,
                    added_on: 1,
                    avatar: 1,
                    likes: 1,
                    is_nsfw: 1,
                    dislikes: 1,
                    totalReviews: 1,
                    averageRating: 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'added_by.first_name': 1,
                    'added_by.last_name': 1,
                    'added_by.username': 1
                }
            }
        ]);

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Increment views
        await Content.updateOne({ _id: content._id }, { $inc: { views: 1 } });

        // Add the incremented view to the response
        content.views += 1;

        res.json({
            result: content
        });
    } catch (error) {
        next(error);
    }
};


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