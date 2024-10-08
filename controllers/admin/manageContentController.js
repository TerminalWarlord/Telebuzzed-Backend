const Request = require('../../models/request');
const Content = require('../../models/content');

const getUserRequests = async (req, res, next) => {


    const requests = await Request.find()
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
    const category = req.body.category;
    const action = req.body.action;
    const request = await Request.findById(requestId).lean();
    if (!request) {
        return res.status(400).json({
            result: {
                message: "Failed to perform intended action!"
            }
        })
    }
    if (action === 'reject') {
        await Request.findByIdAndDelete(requestId);
        return res.json({
            result: {
                message: "Item has been rejected."
            }
        })
    }
    request.category = category;
    delete request._id;
    try {
        const content = await Content.create(request);
        await Request.findByIdAndDelete(requestId);
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

// {
//     "_id": {
//       "$oid": "6702312aaead20c3cf808f32"
//     },
//     "role": "user",
//     "first_name": "Joy",
//     "last_name": "Biswas",
//     "email": "joy@gmail.com",
//     "avater": "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1",
//     "gender": "male",
//     "username": "joy",
//     "password": "$2b$05$b/WzVH7nxwiPrQsYx.bxLegPSvPazFop/YkxaztwnH4VCe8XN/Lf6",
//     "registered_on": {
//       "$date": "2024-10-06T06:41:46.132Z"
//     },
//     "__v": 0
//   }