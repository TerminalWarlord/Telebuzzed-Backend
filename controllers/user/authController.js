const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Content = require('../../models/content');
const Review = require('../../models/review');

const JWT_SECRET = process.env.JWT_SECRET;

const postSignIn = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password)
    const user = await User.findOne({
        username
    })
    console.log(username, password, user)
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
    }, JWT_SECRET);
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
        username: body.username,
    }
    const hashedPassword = await bcrypt.hash(body.password, 5);
    try {
        await User.create({
            ...data,
            password: hashedPassword,
        })
        res.json({
            status: 200,
            result: {
                message: "Successful!"
            }
        })
    }
    catch (err) {
        res.status(401).json({
            status: 401,
            result: {
                message: "Failed"
            }
        })
    }

}


// TODO: optimize getUser


const getUser = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const jwtPayload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(jwtPayload.userId);
        console.log(user);
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
                message: "Invalid token!"
            }
        })
    }
}


const authWall = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const jwtPayload = await jwt.verify(token, JWT_SECRET);
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

module.exports = {
    postSignIn,
    postSignUp,
    getUser,
    authWall

}