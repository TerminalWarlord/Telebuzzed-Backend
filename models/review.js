const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    content_id: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stars: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        validate: {
            validator: function (v) {
                return v % 1 !== 0 || v >= 0 && v <= 5;
            },
            message: props => `${props.value} is not a valid star rating!`
        }
    },
    review: { type: String, required: true }
})

// Add a unique index to enforce one review per content per user
reviewSchema.index({ content_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);