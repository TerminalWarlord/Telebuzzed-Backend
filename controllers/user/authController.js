const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Content = require('../../models/content');
const Review = require('../../models/review');
const createImage = require('../../utils/uploadImageToDb');


const JWT_SECRET = process.env.JWT_SECRET;

const postSignIn = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(req.body);
    let user = await User.findOne({
        email
    })
    if (!user) {
        user = await User.findOne({
            username: email
        })
    }
    console.log(email, password, user)
    if (!user) {
        return res.status(401).json({
            result: {
                message: "User doesn't exist!"
            }
        })
    }
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        return res.status(401).json({
            result: {
                message: "Invalid password"
            }
        })
    }
    const token = jwt.sign({
        userId: user._id,
    }, JWT_SECRET, { expiresIn: '5h' });
    res.json({
        result: {
            message: "Successfully logged in!",
            token
        }
    })
}



const postSignUp = async (req, res, next) => {
    const body = req.body;
    const data = {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        gender: body.gender,
        tg_username: body.tg_username,
    }
    const hashedPassword = await bcrypt.hash(body.password, 5);
    try {
        const user = new User({
            ...data,
            password: hashedPassword,
        })
        await user.generateUsername();
        await user.save();
        res.json({
            status: 200,
            result: {
                message: "You have successfully created an account."
            }
        })
    }
    catch (err) {
        console.log(err); // Log error for debugging

        // Identify the type of error (e.g., duplicate email, validation error)
        let errorMessage = "An error occurred during signup.";

        if (err.code === 11000) {
            // MongoDB duplicate key error (e.g., email or username already exists)
            errorMessage = "Email or username already exists.";
        } else if (err.name === "ValidationError") {
            // Validation errors
            errorMessage = "Invalid data. Please check your input.";
        } else if (err.message) {
            // General error message
            errorMessage = err.message;
        }

        // Send failure response with error message
        res.status(400).json({
            status: 400,
            result: {
                message: errorMessage,
            }
        });
    }

}


// TODO: optimize getUser


const getUser = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const jwtPayload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(jwtPayload.userId);
        // console.log(user);
        const allContent = await Content.find({
            added_by: user._id,
        })
        let channelsAdded = 0, groupsAdded = 0, botsAdded = 0
        allContent.map(item => {
            if (item.type === 'bot') botsAdded += 1;
            else if (item.type === 'channel') channelsAdded += 1;
            else groupsAdded += 1;
        })
        const totalReviews = await Review.countDocuments({
            user_id: user._id
        })
        res.json({
            result: {
                id: user._id,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                registered_on: user.registered_on,
                gender: user.gender,
                username: user.username,
                tg_username: user.tg_username,
                reviews: totalReviews,
                bots_added: botsAdded,
                channels_added: channelsAdded,
                groups_added: groupsAdded,
                avatar: user.avatar
            }
        })
    }
    catch (err) {
        return res.status(401).json({
            result: {
                message: "Invalid token!"
            }
        })
    }
}


const authWall = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const jwtPayload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(jwtPayload.userId);
        req.user = user;
    }
    catch (err) {
        return res.json({
            result: {
                message: "Unauthorized!"
            }
        })
    }
    next();
}



const getFullUserDetails = async (req, res, next) => {
    try {
        const username = req.query.username || req.user.username;
        const user = await User.findOne({
            username
        });
        // console.log(user);
        const allContent = await Content.find({
            added_by: user._id,
        })
        let channelsAdded = 0, groupsAdded = 0, botsAdded = 0
        allContent.map(item => {
            if (item.type === 'bot') botsAdded += 1;
            else if (item.type === 'channel') channelsAdded += 1;
            else groupsAdded += 1;
        })
        const totalReviews = await Review.countDocuments({
            user_id: user._id
        })
        res.json({
            result: {
                id: user._id,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                registered_on: user.registered_on,
                gender: user.gender,
                username: user.username,
                tg_username: user.tg_username,
                reviews: totalReviews,
                bots_added: botsAdded,
                channels_added: channelsAdded,
                groups_added: groupsAdded,
                avatar: user.avatar
            }
        })
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            result: {
                message: "Invalid user!"
            }
        })
    }
}

const putEditProfile = async (req, res, next) => {
    const file = req.file;
    const user = req.user;
    let filePath = null;
    if (file) {
        filePath = await createImage(user.username, file);
    }
    const { first_name, last_name, tg_username } = req.body;
    const updatedData = {
        first_name,
        last_name,
        tg_username
    }

    if (filePath) {
        updatedData.avatar = filePath;
    }
    const test = await User.findById(user._id);
    console.log(file, "140", user._id, test, updatedData)
    await User.findByIdAndUpdate(user._id, updatedData);
    next();
}


const putChangePassword = async (req, res, next) => {
    const { old_password, new_password } = req.body;
    console.log(req.body);
    const user = await User.findById(req.user._id);
    const matchPassword = await bcrypt.compare(old_password, user.password);
    if (!matchPassword) {
        return res.status(403).json({
            result: {
                message: "The old password is incorrect!"
            }
        })
    }
    try {
        const hashedPassword = await bcrypt.hash(new_password, 5);
        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword
        });
        return res.json({
            result: {
                message: "Password has been changed successfully"
            }
        })
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            result: {
                message: "Failed to update your password"
            }
        })
    }

}

module.exports = {
    postSignIn,
    postSignUp,
    getUser,
    getFullUserDetails,
    putEditProfile,
    putChangePassword,
    authWall

}