const Request = require('../../models/request');
const Content = require('../../models/content');

const getUserRequests = async (req, res, next) => {
    const requests = await Request.find({
        status: 'pending'
    })
        .populate({
            path: 'added_by',
            select: 'first_name last_name username'
        });
    res.json({
        result: requests || []
    })
}



const postAdminApproval = async (req, res, next) => {
    const requestId = req.body.request_id;
    const category_id = req.body.category_id;
    const action = req.body.action;
    const reason = req.body.reason;
    const userRequest = await Request.findById(requestId).lean();
    if (!userRequest) {
        return res.status(400).json({
            result: {
                message: "Failed to perform intended action!"
            }
        })
    }
    console.log(action)
    const request = await Request.findById(requestId);
    if (action === 'approve') {
        request.status = 'published';
    }
    else {
        request.status = 'unpublished';
        request.reason = reason;
    }
    request.save();
    if (action === 'reject') {
        return res.json({
            result: {
                message: "Item has been rejected."
            }
        })
    }
    userRequest.category_id = category_id;
    delete userRequest._id;
    try {
        await Content.create(userRequest);
        return res.json({
            result: {
                message: "Item has been approved."
            }
        })
    }
    catch (err) {
        console.log(err);
    }


    return res.json({
        result: {
            message: "Something went wrong!"
        }
    })
}

module.exports = {
    getUserRequests,
    postAdminApproval
}

