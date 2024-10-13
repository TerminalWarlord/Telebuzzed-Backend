const Content = require('../../models/content');
const Review = require('../../models/review');
const postUserReview = async (req, res, next) => {
    const { username, review, rating } = req.body;
    const parsedRating = parseInt(rating);

    try {
        const content = await Content.findOne({ username });
        if (!content) {
            return res.status(400).json({
                result: {
                    message: "Could not find content!",
                }
            });
        }

        // Check if a review already exists for the same content and user
        const existingReview = await Review.findOne({
            content_id: content._id,
            user_id: req.user._id,
        });

        if (existingReview) {
            return res.status(400).json({
                result: {
                    message: "You have already reviewed this content!",
                }
            });
        }

        // Create a new review if no existing review is found
        const newReview = await Review.create({
            content_id: content._id,
            user_id: req.user._id,
            review,
            stars: parsedRating,
        });

        // Populate the fields
        const populatedReview = await Review.findById(newReview._id)
            .populate('user_id', 'first_name last_name avatar username')
            .populate('content_id', 'name avatar username type');

        return res.json({
            result: {
                message: "Your review has been posted!",
                review: populatedReview,
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            result: {
                message: "An error occurred while posting the review.",
            }
        });
    }
};
const getReviews = async (req, res, next) => {
    const { offset = 1, limit = 10, reviewer, username: content_username } = req.query;
    const skip = (parseInt(offset) - 1) * parseInt(limit);

    try {
        let query = Review.find();

        if (reviewer) {
            query = query.populate({
                path: 'user_id',
                match: { username: reviewer },
                select: 'first_name last_name avatar username'
            });
        } else {
            query = query.populate('user_id', 'first_name last_name avatar username');
        }

        if (content_username) {
            query = query.populate({
                path: 'content_id',
                match: { username: content_username },
                select: 'name avatar username type'
            });
        } else {
            query = query.populate('content_id', 'name avatar username type');
        }

        const totalCount = await Review.countDocuments();

        let reviews = await query.exec();

        // Filter out reviews where populated fields are null due to match conditions
        reviews = reviews.filter(review => review.user_id && review.content_id);

        // Apply skip and limit after filtering
        const paginatedReviews = reviews.slice(skip, skip + parseInt(limit));

        const hasNextPage = skip + paginatedReviews.length < reviews.length;

        return res.json({
            hasNextPage,
            totalCount,
            result: paginatedReviews
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    postUserReview,
    getReviews
}