const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const userSchema = new Schema({
    role: { type: String, default: 'user' },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    registered_on: { type: Date, required: true, default: Date.now },
    avatar: { type: String, default: "default.png" },
    gender: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);