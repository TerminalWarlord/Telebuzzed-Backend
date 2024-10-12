const mongoose = require('mongoose');
const slugify = require('slugify');


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

userSchema.methods.generateUsername = async function () {
    // Combine first name and last name, and make it lowercase
    let baseUsername = `${this.first_name}.${this.last_name}`;
    let slugifedUsername = slugify(baseUsername.trim(), { lower: true, strict: true })

    // Check if the base username already exists
    let existingUser = await this.constructor.findOne({ username: slugifedUsername });

    if (!existingUser) {
        // If the base username is not taken, use it
        this.username = slugifedUsername;
        return;
    } else {
        // If taken, append a random number (or some other strategy)
        let counter = 1;
        let newUsername = `${slugifedUsername}${counter}`;

        // Keep checking until a unique username is found
        while (await this.constructor.findOne({ username: newUsername })) {
            counter++;
            newUsername = `${slugifedUsername}${counter}`;
        }
        this.username = newUsername;
        return;
    }
};

module.exports = mongoose.model('User', userSchema);