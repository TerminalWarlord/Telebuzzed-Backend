const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const imageSchema = new Schema({
    path: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    caption: { type: String }
});

module.exports = mongoose.model('Image', imageSchema);