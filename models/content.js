const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const contentSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    type: { type: String, default: 'bot' },
    members: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    language: { type: String, default: 'english' },
    descrition: { type: String, required: true },
    category: { type: String, required: true },
    views: { type: String, default: 1 },
    added_on: { type: Date, default: Date.now() },
    avatar: { type: String },
    likes: { type: Number, default: 0 },
    is_nsfw: { type: Boolean, default: false },
    dislikes: { type: Number, default: 0 },
})


module.exports = mongoose.model('Content', contentSchema);