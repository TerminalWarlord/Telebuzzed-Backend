const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    is_post: { type: Boolean, default: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'User' },
    featured_image: { type: String, default: 'default_thumb.png' },
    posted_on: { type: Date, default: Date.now() },
});

module.exports = mongoose.model('Post', postSchema);