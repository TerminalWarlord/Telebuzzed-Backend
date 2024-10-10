const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    isPost: { type: Boolean, default: true },
    featuredImage: { type: String, default: 'default_thumb.png' },
});

module.exports = mongoose.model('Post', postSchema);