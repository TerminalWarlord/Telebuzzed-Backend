const Content = require('../../models/content');
const Review = require('../../models/review');


const postUserReview = async (req, res, next) => {
    const body = req.body;
    const username = body.username;
    const review = body.review;
    const rating = parseInt(body.rating);
    const content = await Content.findOne({
        username: username
    });
    if (!content) {
        return res.status(400).json({
            result: {
                message: "Could not find content!",
            }
        })
    }
    try {
        await Review.create({
            content_id: content._id,
            user_id: req.user._id,
            review: review,
            stars: rating,
        })
        return res.json({
            result: {
                message: "Your review has been posted!",
            }
        });
    }
    catch (err) {
        return res.status(400).json({
            result: {
                message: "Could not find content!",
            }
        })
    }


}
const getReviews = async (req, res, next) => {
    const query = req.query;
    const offset = parseInt(query.offset) || 1;
    const limit = parseInt(query.limit) || 10;
    const reviewer = query.reviewer;
    const content_username = query.username;
    const skip = (offset - 1) * limit;
    let reviews;

    if (reviewer) {
        const allReviews = await Review.find()
            .populate({ path: 'content_id', select: 'name avatar username' })
            .populate({ path: 'user_id', select: 'first_name last_name avatar username' })
            .limit(limit)
            .skip(skip)
            .exec();
        reviews = allReviews.filter(review => review.user_id.username === reviewer);
    }
    if (content_username) {
        const allReviews = await Review.find()
            .populate({ path: 'content_id', select: 'name avatar username' })
            .populate({ path: 'user_id', select: 'first_name last_name avatar username' })
            .limit(limit)
            .skip(skip)
            .exec();
        reviews = allReviews.filter(review => review.content_id.username === content_username);
    }
    return res.json({
        result: reviews
    })
}


module.exports = {
    postUserReview,
    getReviews
}