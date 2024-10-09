const express = require('express');
const { authWall } = require('../../controllers/user/authController');
const { postRequest, getList, getContent, getPendingRequests } = require('../../controllers/user/contentController');
const { postUserReview, getReviews } = require('../../controllers/user/reviewController')
const router = express.Router();

const multer = require('multer');
const { getCategories } = require('../../controllers/user/categoryController');
const upload = multer();

router.post('/user/request', authWall, upload.none(), postRequest);

router.post('/user/review', authWall, upload.none(), postUserReview);
router.get('/reviews', getReviews);
router.get('/categories', getCategories);


router.get('/pending-requests', authWall, getPendingRequests);

router.get('/list', getList);
router.get('/details/:username', getContent);





module.exports = router;