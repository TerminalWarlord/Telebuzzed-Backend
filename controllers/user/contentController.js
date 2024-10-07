const Request = require('../../models/request');

const getTelegramDetails = require('../../utils/getTelegramInfo');

const postRequest = async (req, res, next) => {
    const body = req.body;
    const content = await getTelegramDetails(body.username);
    content.category = body.category;
    content.language = body.language;
    content.is_nsfw = body.is_nsfw ? true : false;

    try {
        await Request.create(content);
    }
    catch (error) {
        return res.status(400).json({
            result: {
                message: "Failed to add!"
            }
        })
    }

    res.json({
        result: {
            message: "Successfully added!"
        }
    })
}


module.exports = {
    postRequest
}